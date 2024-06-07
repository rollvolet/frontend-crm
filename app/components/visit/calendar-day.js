import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { compare } from '@ember/utils';
import { task } from 'ember-concurrency';
import uniqBy from 'lodash/uniqBy';
import Calendar from '@event-calendar/core';
import TimeGrid from '@event-calendar/time-grid';
import ResourceTimeGrid from '@event-calendar/resource-time-grid';
import Interaction from '@event-calendar/interaction';
import addDays from 'date-fns/addDays';
import isFuture from 'date-fns/isFuture';
import isToday from 'date-fns/isToday';
import formatISO from 'date-fns/formatISO';
import addHours from 'date-fns/addHours';
import { svgJar } from 'ember-svg-jar/helpers/svg-jar';
import { formatDate } from '../../helpers/format-date';
import { formatRequestNumber } from '../../helpers/format-request-number';
import constants from '../../config/constants';
import { TAILWIND_COLORS, DEFAULT_TIME_SLOT_DURATION_IN_HOURS } from '../../config';

import fullAddress from '../../helpers/full-address';
import formatCustomerName from '../../helpers/format-customer-name';

const { CALENDAR_DAY_STATUSES, EMPLOYEE_TYPES } = constants;
const HOURS_PER_DAY = 24;
const CALENDAR_RESOURCE_WIDTH_PX = 300;

const employeeSort = function (a, b) {
  if (a && b) {
    return compare(a.firstName, b.firstName);
  } else if (!a) {
    return 1;
  } else {
    return -1;
  }
};

export default class VisitCalendarDayComponent extends Component {
  @service store;
  @service router;

  targetElement;
  calendar;
  @tracked timeSlots = [];
  @tracked employees = [];
  @tracked requests = [];
  @tracked freeTextTimeSlot;

  @tracked isOpenAddResourceModal = false;
  @tracked isOpenFreeTextTimeSlotModal = false;

  get currentMeasurers() {
    return this.store
      .peekAll('employee')
      .filter((employee) => employee.isActive && employee.types.includes(EMPLOYEE_TYPES.MEASURER));
  }

  loadUnplannedRequests = task({ keepLatest: true }, async (date) => {
    this.requests = await this.store.queryAll('request', {
      include: 'visitor,case.customer.address.country,case.building.address.country',
      'filter[:has-no:time-slot]': 't',
      'filter[indicative-visit-date]': formatISO(date, { representation: 'date' }),
    });
  });

  loadEventsAndResources = task({ keepLatest: true }, async (date) => {
    const nextDay = addDays(date, 1);

    // Fetch timeslots related to requests
    const requestTimeSlots = (
      await this.store.queryAll('time-slot', {
        include: [
          'request.visitor',
          'request.case.customer.address.country',
          'request.case.building.address.country',
        ].join(','),
        'filter[:has:request]': 't',
        'filter[:gte:start]': formatISO(date),
        'filter[:lte:start]': formatISO(nextDay),
      })
    ).toArray();
    const requests = await Promise.all(requestTimeSlots.map((timeSlot) => timeSlot.request));
    let visitors = await Promise.all(requests.map((request) => request.visitor));
    if (isToday(date) || isFuture(date)) {
      // For future planning, add the current employees with role 'Measurer' by default
      visitors = [...visitors, ...this.currentMeasurers];
    }

    // Fetch timeslots related to employees
    const employeeTimeSlots = (
      await this.store.queryAll('time-slot', {
        include: 'employee',
        'filter[:has:employee]': 't',
        'filter[:gte:start]': formatISO(date),
        'filter[:lte:start]': formatISO(nextDay),
      })
    ).toArray();
    const employees = await Promise.all(employeeTimeSlots.map((timeSlot) => timeSlot.employee));

    // Update component state
    this.timeSlots = [...requestTimeSlots, ...employeeTimeSlots];
    this.employees = uniqBy([...visitors, ...employees], 'id').sort(employeeSort);

    // Create objects for calendar
    const calendarEvents = await Promise.all(this.timeSlots.map(this.timeSlotToCalendarEvent));
    const calendarResources = this.employees.map(this.employeeToCalendarResource);

    return { events: calendarEvents, resources: calendarResources };
  });

  navigateToDate = task({ keepLatest: true }, async (date) => {
    this.args.onDidChangeDate(date);
    const { events, resources } = await this.loadEventsAndResources.perform(date);
    this.calendar.setOption('resources', resources);
    this.calendar.setOption('events', events);
    this.updateCalendarWidth();
    await this.loadUnplannedRequests.perform(date);
  });

  updateTimeSlot = task(async (timeSlot, start, end) => {
    timeSlot.start = start;
    timeSlot.end = end;
    if (timeSlot.hasDirtyAttributes) {
      await timeSlot.save();
    }
  });

  updateVisitor = task(async (request, employeeId) => {
    if (employeeId == 'undefined') {
      request.visitor = null;
    } else {
      const employee = await this.store.findRecord('employee', employeeId);
      request.visitor = employee;
    }
    await request.save();
  });

  updateEmployee = task(async (timeSlot, employeeId) => {
    if (employeeId == 'undefined') {
      timeSlot.employee = null;
    } else {
      const employee = await this.store.findRecord('employee', employeeId);
      timeSlot.employee = employee;
    }
    await timeSlot.save();
  });

  addResourceToCalendar = task(async (employee) => {
    if (employee && !this.employees.includes(employee)) {
      const employees = [...this.employees, employee];
      this.employees = employees.sort(employeeSort);
      const calendarResources = this.employees.map(this.employeeToCalendarResource);
      this.calendar.setOption('resources', calendarResources);
      this.updateCalendarWidth();
    }
    this.closeAddResourceModal();
  });

  updateCalendarWidth() {
    const calendarEl = this.targetElement.getElementsByClassName('ec')[0];
    const width = CALENDAR_RESOURCE_WIDTH_PX * this.employees.length + 65;
    calendarEl.style.setProperty('min-width', `${width}px`);
  }

  renderCalendar = task(async (element) => {
    this.targetElement = element;

    const date = this.args.model.toDate();
    const { events, resources } = await this.loadEventsAndResources.perform(date);
    await this.loadUnplannedRequests.perform(date);

    this.calendar = new Calendar({
      target: element,
      props: {
        plugins: [TimeGrid, ResourceTimeGrid, Interaction],
        options: {
          view: 'resourceTimeGridDay',
          locale: 'nl-BE',
          firstDay: 1,
          allDaySlot: false,
          displayEventEnd: false,
          date: date,
          resources: resources,
          events: events,
          editable: true,
          slotHeight: 36,
          height: '1200px',
          scrollTime: '07:00:00',
          theme: function (theme) {
            return {
              ...theme,
              button: 'rlv-ec-button',
              buttonGroup: 'rlv-ec-button-group',
              today: null,
            };
          },
          titleFormat: function (start) {
            const dateIso = formatISO(start, { representation: 'date' });
            const dateHuman = formatDate([start, 'd LLLL yyyy']);
            const day = formatDate([start, 'EEEE']);

            return {
              html: `
                <div>
                  <h1 class="text-base font-semibold leading-6 text-gray-900 whitespace-nowrap">
                    <time datetime="${dateIso}">${dateHuman}</time>
                  </h1>
                  <p class="mt-1 text-sm text-gray-500">${day}</p>
                </div>
               `,
            };
          },
          buttonText: function (text) {
            return {
              ...text,
              previous: 'Vorige',
              today: 'Vandaag',
              next: 'Volgende',
            };
          },
          customButtons: {
            'add-resource': {
              text: 'Voeg kolom toe',
              click: () => {
                this.isOpenAddResourceModal = true;
              },
            },
          },
          headerToolbar: {
            start: 'title',
            center: '',
            end: 'add-resource prev,today,next',
          },
          datesSet: (info) => this.navigateToDate.perform(info.start),
          eventResize: (info) => {
            const { extendedProps, start, end } = info.event;
            const { timeSlot } = extendedProps;
            this.updateTimeSlot.perform(timeSlot, start, end);
          },
          eventDrop: (info) => {
            const { extendedProps, start, end } = info.event;
            const { timeSlot, request } = extendedProps;
            this.updateTimeSlot.perform(timeSlot, start, end);
            if (info.newResource) {
              if (request) {
                this.updateVisitor.perform(request, info.newResource.id);
              } else {
                this.updateEmployee.perform(timeSlot, info.newResource.id);
              }
            }
          },
          eventClick: (info) => {
            const { timeSlot, case: _case, request } = info.event.extendedProps;
            if (request) {
              this.router.transitionTo('main.case.request.edit.index', _case.id, request.id);
            } else {
              this.openFreeTextTimeSlotModal(timeSlot);
            }
          },
        },
      },
    });

    this.updateCalendarWidth();

    // Finetune toolbar buttons
    const addResourceBtn = element.getElementsByClassName('ec-add-resource')[0];
    addResourceBtn.innerHTML = svgJar('user-add-line', { class: 'w-5 h-5' });
    const prevBtn = element.getElementsByClassName('ec-prev')[0];
    prevBtn.innerHTML = svgJar('arrow-left-s-line', { class: 'w-5 h-5' });
    const nextBtn = element.getElementsByClassName('ec-next')[0];
    nextBtn.innerHTML = svgJar('arrow-right-s-line', { class: 'w-5 h-5' });

    // Restructure DOM tree. Move unplanned requests container inside the calendar
    const rootNode = element.getRootNode();
    const container = rootNode.getElementById('unplanned-requests-container');
    const toolbar = element.getElementsByClassName('ec-toolbar')[0];
    toolbar.insertAdjacentElement('afterend', container);
    container.classList.remove('hidden');

    const toolbarCenter = toolbar.children[1];
    const toolbarCenterContainer = rootNode.getElementById('toolbar-center-container');
    toolbarCenter.replaceChildren(toolbarCenterContainer);
    toolbarCenter.classList.add('w-full', '-mt-5', 'ml-2');
    toolbarCenterContainer.classList.remove('hidden');
  });

  @action
  async dropRequestOnCalendar({ request }, { event }) {
    // Determine employee column in which object is dropped
    const domResourceColumn = event.target.parentElement.parentElement;
    const domResourceList = domResourceColumn.parentElement.getElementsByClassName('ec-resource');
    const domColumnIndex = [...domResourceList].indexOf(domResourceColumn);
    const employee = this.employees[domColumnIndex];

    // Determine hours on which object is dropped
    const dropHeight = event.layerY;
    const columnHeight = event.target.clientHeight;
    const hour = (1.0 * HOURS_PER_DAY * dropHeight) / columnHeight;
    const start = this.args.model.toDate();
    start.setHours(Math.floor(hour));
    start.setMinutes(Math.round(hour) > Math.floor(hour) ? 30 : 0);
    const end = addHours(start, DEFAULT_TIME_SLOT_DURATION_IN_HOURS);

    if (request) {
      request.visitor = employee;
      await request.save();

      const timeSlot = this.store.createRecord('time-slot', {
        title: 'Klantenbezoek',
        start,
        end,
        request,
      });
      await timeSlot.save();

      // Add new timeslot to calendar
      this.timeSlots = [...this.timeSlots, timeSlot];
      this.calendar.addEvent(await this.timeSlotToCalendarEvent(timeSlot));

      // Remove request from unplanned requests container
      this.requests = this.requests.filter((r) => r != request);
    } else {
      // It's the free-text timeslot placeholder that is dropped
      const timeSlot = this.store.createRecord('time-slot', {
        start,
        end,
        employee,
      });
      this.openFreeTextTimeSlotModal(timeSlot);
    }
  }

  saveFreeTextTimeSlot = task(async (timeSlot) => {
    await timeSlot.save();

    if (this.timeSlots.includes(timeSlot)) {
      this.calendar.updateEvent(await this.timeSlotToCalendarEvent(timeSlot));
    } else {
      // Add new timeslot to calendar
      this.timeSlots = [...this.timeSlots, timeSlot];
      this.calendar.addEvent(await this.timeSlotToCalendarEvent(timeSlot));
    }

    this.closeFreeTextTimeSlotModal();
  });

  @action
  async toggleStatus() {
    if (this.args.model.visitStatus == CALENDAR_DAY_STATUSES.FULL) {
      this.args.model.visitStatus = CALENDAR_DAY_STATUSES.FREE;
    } else {
      this.args.model.visitStatus = CALENDAR_DAY_STATUSES.FULL;
    }
    await this.args.model.save();
  }

  @action
  closeAddResourceModal() {
    this.isOpenAddResourceModal = false;
  }

  @action
  openFreeTextTimeSlotModal(timeSlot) {
    this.freeTextTimeSlot = timeSlot;
    this.isOpenFreeTextTimeSlotModal = true;
  }

  @action
  closeFreeTextTimeSlotModal() {
    this.freeTextTimeSlot = null;
    this.isOpenFreeTextTimeSlotModal = false;
  }

  async timeSlotToCalendarEvent(timeSlot) {
    const [request, employee] = await Promise.all([timeSlot.request, timeSlot.employee]);

    const calendarEvent = {
      id: timeSlot.id,
      allDay: false,
      start: timeSlot.start,
      end: timeSlot.end,
      extendedProps: { timeSlot },
    };

    if (request) {
      const visitor = await request.visitor;
      const _case = await request.case;
      const customer = await _case.customer;
      const building = await _case.building;
      const address = building ? await building.address : await customer.address;

      calendarEvent.resourceIds = visitor ? [visitor.id] : ['unassigned'];
      calendarEvent.extendedProps.request = request;
      calendarEvent.extendedProps.case = _case;
      calendarEvent.backgroundColor = TAILWIND_COLORS.BLUE_50;
      calendarEvent.title = {
        html: `
          <div class="flex flex-row flex-wrap items-center justify-between">
            <div class="rounded px-1 bg-blue-200 text-blue-700">
              AD${formatRequestNumber([request.number])}
            </div>
            <div class="flex flex-row items-center space-x-1 text-blue-500">
              ${svgJar('time-line', { class: 'w-4 h-4 flex-0 text-blue-400' })}
              <span>${request.indicativeVisitPeriod}</span>
            </div>
          </div>
          <div>
            <span class="font-semibold text-blue-700">
              ${formatCustomerName(customer)}
            </span>
            <span class="text-blue-500">
              - ${fullAddress(address)}
            </span>
          </div>
          <div class="text-blue-500 text-[10px] text-ellipsis">
            ${request.description}
          </div>
        `,
      };
    } else if (employee) {
      calendarEvent.resourceIds = [employee.id];
      calendarEvent.backgroundColor = TAILWIND_COLORS.ORANGE_50;
      calendarEvent.title = {
        html: `
          <div class="flex flex-row items-center space-x-1 text-orange-700 font-semibold">
            ${svgJar('user-line', { class: 'w-4 h-4 flex-0 text-orange-400' })}
            <span>${timeSlot.title}</span>
          </div>
          <div class="text-orange-500 text-[10px] text-ellipsis">
            ${timeSlot.description || ''}
          </div>
        `,
      };
    }

    return calendarEvent;
  }

  employeeToCalendarResource(visitor) {
    if (visitor) {
      return { id: visitor.id, title: visitor.firstName };
    } else {
      return { id: 'unassigned', title: 'Niet toegewezen' };
    }
  }
}

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
import fullAddress from '../../helpers/full-address';
import formatCustomerName from '../../helpers/format-customer-name';

const { EMPLOYEE_TYPES } = constants;
const HOURS_PER_DAY = 24;

export default class VisitCalendarDayComponent extends Component {
  @service store;
  @service router;

  @tracked calendar;
  @tracked timeSlots = [];
  @tracked employees = [];
  @tracked requests = [];

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

    const timeSlots = await this.store.queryAll('time-slot', {
      include: [
        'request.visitor',
        'request.case.customer.address.country',
        'request.case.building.address.country',
      ].join(','),
      'filter[:has:request]': 't',
      'filter[:gte:start]': formatISO(date),
      'filter[:lte:start]': formatISO(nextDay),
    });
    // eslint-disable-next-line ember/no-array-prototype-extensions
    this.timeSlots = timeSlots.toArray();

    const requests = await Promise.all(this.timeSlots.map((timeSlot) => timeSlot.request));
    let visitors = await Promise.all(requests.map((request) => request.visitor));
    if (isToday(date) || isFuture(date)) {
      // For future planning, add the current employees with role 'Measurer' by default
      visitors = [...visitors, ...this.currentMeasurers];
    }
    this.employees = uniqBy(visitors, 'id').sort((a, b) => {
      if (a && b) {
        return compare(a.firstName, b.firstName);
      } else if (!a) {
        return 1;
      } else {
        return -1;
      }
    });

    const calendarEvents = await Promise.all(this.timeSlots.map(this.timeSlotToCalendarEvent));
    const calendarResources = this.employees.map(this.employeeToCalendarResource);

    return { events: calendarEvents, resources: calendarResources };
  });

  navigateToDate = task({ keepLatest: true }, async (date) => {
    this.args.onDidChangeDate(date);
    const { events, resources } = await this.loadEventsAndResources.perform(date);
    this.calendar.setOption('resources', resources);
    this.calendar.setOption('events', events);
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

  renderCalendar = task(async (element) => {
    const { events, resources } = await this.loadEventsAndResources.perform(this.args.date);
    await this.loadUnplannedRequests.perform(this.args.date);

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
          date: this.args.date,
          resources: resources,
          events: events,
          editable: true,
          theme: function (theme) {
            return {
              ...theme,
              button: 'rlv-ec-button',
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
                  <h1 class="text-base font-semibold leading-6 text-gray-900">
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
          headerToolbar: {
            start: 'title',
            center: '',
            end: 'prev,today,next',
          },
          // slotHeight: 32,
          // User clicks previous/next day button
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
              this.updateVisitor.perform(request, info.newResource.id);
            }
          },
          eventClick: (info) => {
            const { case: _case, request } = info.event.extendedProps;
            this.router.transitionTo('main.case.request.edit.index', _case.id, request.id);
          },
        },
      },
    });
  });

  @action
  async dropRequest(request, { event }) {
    const domResourceColumn = event.target.parentElement.parentElement;
    const domResourceList = domResourceColumn.parentElement.getElementsByClassName('ec-resource');
    const domColumnIndex = [...domResourceList].indexOf(domResourceColumn);
    request.visitor = this.employees[domColumnIndex];
    await request.save();

    const dropHeight = event.layerY;
    const columnHeight = event.target.clientHeight;
    const hour = (1.0 * HOURS_PER_DAY * dropHeight) / columnHeight;
    const start = new Date(request.indicativeVisitDate);
    start.setHours(Math.floor(hour));
    start.setMinutes(Math.round(hour) > Math.floor(hour) ? 30 : 0);
    const end = addHours(start, 1);

    const timeSlot = this.store.createRecord('time-slot', {
      start,
      end,
      request,
    });
    await timeSlot.save();

    this.timeSlots = [...this.timeSlots, timeSlot];
    this.calendar.addEvent(await this.timeSlotToCalendarEvent(timeSlot));
    this.requests = this.requests.filter((r) => r != request);
  }

  async timeSlotToCalendarEvent(timeSlot) {
    const request = await timeSlot.request;
    const visitor = await request.visitor;
    const _case = await request.case;
    const customer = await _case.customer;
    const building = await _case.building;
    const address = building ? await building.address : await customer.address;

    return {
      id: timeSlot.id,
      resourceIds: visitor ? [visitor.id] : ['unassigned'],
      allDay: false,
      start: timeSlot.start,
      end: timeSlot.end,
      title: {
        html: `
              <div class="flex flex-row items-center justify-between">
                <div class="flex flex-row items-center space-x-1 text-blue-500">
                  ${svgJar('survey-line', { class: 'w-4 h-4 flex-0' })}
                  <span>AD${formatRequestNumber([request.number])}</span>
                </div>
                <div class="flex flex-row items-center space-x-1 text-blue-500">
                  ${svgJar('time-line', { class: 'w-4 h-4 flex-0' })}
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
      },
      extendedProps: {
        timeSlot,
        request,
        case: _case,
      },
    };
  }

  employeeToCalendarResource(visitor) {
    if (visitor) {
      return { id: visitor.id, title: visitor.firstName };
    } else {
      return { id: 'unassigned', title: 'Niet toegewezen' };
    }
  }
}

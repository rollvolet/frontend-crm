import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { compare } from '@ember/utils';
import { keepLatestTask } from 'ember-concurrency';
import uniqBy from 'lodash/uniqBy';
import Calendar from '@event-calendar/core';
import TimeGrid from '@event-calendar/time-grid';
import ResourceTimeGrid from '@event-calendar/resource-time-grid';
import Interaction from '@event-calendar/interaction';
import addDays from 'date-fns/addDays';
import isFuture from 'date-fns/isFuture';
import isToday from 'date-fns/isToday';
import formatISO from 'date-fns/formatISO';
import { formatRequestNumber } from '../../helpers/format-request-number';
import constants from '../../config/constants';

const { EMPLOYEE_TYPES } = constants;

export default class VisitCalendarDayComponent extends Component {
  @service store;
  @service router;

  @tracked calendar;
  get currentMeasurers() {
    return this.store
      .peekAll('employee')
      .filter((employee) => employee.isActive && employee.types.includes(EMPLOYEE_TYPES.MEASURER));
  }


  @keepLatestTask
  *loadEventsAndResources(date) {
    const nextDay = addDays(date, 1);

    const timeSlots = yield this.store.queryAll('time-slot', {
      include: 'request.visitor,request.case.customer',
      'filter[:has:request]': 't',
      'filter[:gte:start]': formatISO(date),
      'filter[:lte:start]': formatISO(nextDay),
    });

    const requests = yield Promise.all(timeSlots.map((timeSlot) => timeSlot.request));
    let visitors = yield Promise.all(requests.map((request) => request.visitor));
    if (isToday(date) || isFuture(date)) {
      // For future planning, add the current employees with role 'Measurer' by default
      visitors = [...visitors, ...this.currentMeasurers];
    }
    visitors = uniqBy(visitors, 'id');

    const calendarEvents = yield Promise.all(
      timeSlots.map(async (timeSlot) => {
        const request = await timeSlot.request;
        const visitor = await request.visitor;
        const _case = await request.case;
        const customer = await _case.customer;
        return {
          id: timeSlot.id,
          resourceIds: visitor ? [visitor.id] : ['unassigned'],
          allDay: false,
          start: timeSlot.start,
          end: timeSlot.end,
          title: {
            html: `
              AD${formatRequestNumber([request.number])}
              | ${request.indicativeVisitPeriod}
              | ${customer.name}
            `,
          },
          extendedProps: {
            timeSlot,
            request,
            case: _case,
          },
        };
      })
    );

    const calendarResources = visitors
      .map((visitor) => {
        if (visitor) {
          return { id: visitor.id, title: visitor.firstName };
        } else {
          return { id: 'unassigned', title: 'Niet toegewezen' };
        }
      })
      .sort((a, b) => {
        if (a.id == 'unassigned') {
          return 1;
        } else if (b.id == 'unassigned') {
          return -1;
        } else {
          return compare(a.firstName, b.firstName);
        }
      });

    return { events: calendarEvents, resources: calendarResources };
  }

  @action
  async renderCalendar(element) {
    const { events, resources } = await this.loadEventsAndResources.perform(this.args.date);

    const updateDate = async (date) => {
      this.args.onDidChangeDate(date);
      const { events, resources } = await this.loadEventsAndResources.perform(date);
      this.calendar.setOption('resources', resources);
      this.calendar.setOption('events', events);
    };

    const updateTimeSlot = async (timeSlot, start, end) => {
      timeSlot.start = start;
      timeSlot.end = end;
      if (timeSlot.hasDirtyAttributes) {
        await timeSlot.save();
      }
    };

    const updateVisitor = async (request, employeeId) => {
      if (employeeId == 'undefined') {
        request.visitor = null;
      } else {
        const employee = await this.store.findRecord('employee', employeeId);
        request.visitor = employee;
      }
      await request.save();
    };

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
          eventClassNames:
            'bg-gray-200 text-gray-900 rounded text-sm px-2 py-1 border border-gray-300',
          date: this.args.date,
          resources: resources,
          events: events,
          editable: true,
          theme: function (theme) {
            theme.today = null;
            return theme;
          },
          // User clicks previous/next day button
          datesSet: (info) => updateDate(info.start),
          eventResize: (info) => {
            const { extendedProps, start, end } = info.event;
            const { timeSlot } = extendedProps;
            updateTimeSlot(timeSlot, start, end);
          },
          eventDrop: (info) => {
            const { extendedProps, start, end } = info.event;
            const { timeSlot, request } = extendedProps;
            updateTimeSlot(timeSlot, start, end);
            if (info.newResource) {
              updateVisitor(request, info.newResource.id);
            }
          },
          eventClick: (info) => {
            const { case: _case, request } = info.event.extendedProps;
            this.router.transitionTo('main.case.request.edit.index', _case.id, request.id);
          },
        },
      },
    });
  }
}

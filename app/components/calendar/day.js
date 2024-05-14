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
import formatISO from 'date-fns/formatISO';
import { formatRequestNumber } from '../../helpers/format-request-number';

export default class CalendarDayComponent extends Component {
  @service store;
  @service router;

  @tracked calendar;
  @tracked date = this.args.date || new Date(Date.parse('2024-05-15T00:00:00'));

  @keepLatestTask
  *loadEvents(date) {
    const nextDay = addDays(date, 1);

    const timeSlots = yield this.store.queryAll('time-slot', {
      include: 'request.visitor,request.case.customer',
      'filter[:has:request]': 't',
      'filter[:gte:start]': formatISO(date),
      'filter[:lte:start]': formatISO(nextDay),
    });

    const requests = yield Promise.all(timeSlots.map((timeSlot) => timeSlot.request));
    const visitors = yield Promise.all(requests.map((request) => request.visitor));

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

    // TODO add all opmeters to the list by default
    const calendarResources = uniqBy(visitors, 'id')
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
    const { events, resources } = await this.loadEvents.perform(this.date);

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
          date: this.date,
          resources: resources,
          events: events,
          editable: true,
          // User clicks previous/next day button
          datesSet: (info) => this.updateDate(info.start),
          eventResize: (info) => {
            const event = info.event;
            this.updateTimeSlot(event.id, event.start, event.end);
          },
          eventDrop: (info) => {
            const event = info.event;
            this.updateTimeSlot(event.extendedProps.timeSlot, event.start, event.end);
            if (info.newResource) {
              this.updateVisitor(event.extendedProps.request, info.newResource.id);
            }
          },
          eventClick: (info) => {
            const props = info.event.extendedProps;
            this.router.transitionTo(
              'main.case.request.edit.index',
              props.case.id,
              props.request.id
            );
          },
        },
      },
    });
  }

  async updateDate(date) {
    this.date = date;
    const { events, resources } = await this.loadEvents.perform(date);
    this.calendar.setOption('resources', resources);
    this.calendar.setOption('events', events);
  }

  async updateTimeSlot(timeSlot, start, end) {
    timeSlot.start = start;
    timeSlot.end = end;
    if (timeSlot.hasDirtyAttributes) {
      await timeSlot.save();
    }
  }

  async updateVisitor(request, employeeId) {
    if (employeeId == 'undefined') {
      request.visitor = null;
    } else {
      const employee = await this.store.findRecord('employee', employeeId);
      request.visitor = employee;
    }
    await request.save();
  }
}

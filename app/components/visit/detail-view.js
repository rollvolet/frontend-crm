import Component from '@glimmer/component';
import fetch from 'fetch';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { keepLatestTask } from 'ember-concurrency-decorators';

export default class VisitDetailViewComponent extends Component {
  @tracked calendarEvent

  constructor() {
    super(...arguments);
    this.loadCalendarEvent.perform();
  }

  get isNotAvailableInCalendar() {
    return this.calendarEvent && isEmpty(this.calendarEvent.calendarSubject);
  }

  @keepLatestTask
  *loadCalendarEvent() {
    try {
      this.calendarEvent = yield this.args.model.calendarEvent;
    } catch(e) {
      // Something went wrong
    }

  }

  @keepLatestTask
  *synchronize() {
    yield fetch(`/api/orders/${this.args.model.id}/planning-event`, {
      method: 'PUT'
    });
    yield this.loadCalendarEvent.perform();
  }
}

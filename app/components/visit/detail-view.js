import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import fetch, { Headers } from 'fetch';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { keepLatestTask } from 'ember-concurrency-decorators';

export default class VisitDetailViewComponent extends Component {
  @service session

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
    this.calendarEvent = yield this.args.model.calendarEvent;
  }

  @keepLatestTask
  *synchronize() {
    const { access_token } = this.get('session.data.authenticated');
    yield fetch(`/api/orders/${this.args.model.id}/planning-event`, {
      method: 'PUT',
      headers: new Headers({
        Authorization: `Bearer ${access_token}`
      })
    });
    yield this.loadCalendarEvent.perform();
  }
}

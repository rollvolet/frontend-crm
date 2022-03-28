import Component from '@glimmer/component';
import fetch, { Headers } from 'fetch';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';

export default class CalendarEventDetailViewComponent extends Component {
  @tracked isMissingInCalendar = false;

  constructor() {
    super(...arguments);
    this.checkExistenceInMsCalendar.perform();
  }

  @keepLatestTask
  *checkExistenceInMsCalendar() {
    if (this.args.model && this.args.model.id) {
      const response = yield fetch(`/calendar-events/${this.args.model.id}/ms-event`, {
        method: 'GET',
        headers: new Headers({
          Accept: 'application/json',
        }),
      });
      if (response.ok) {
        const json = yield response.json();
        this.isMissingInCalendar = json.data?.id == null;
      } else {
        this.isMissingInCalendar = true;
      }
    } else {
      this.isMissingInCalendar = false;
    }
  }

  @keepLatestTask
  *synchronize() {
    yield this.args.onSynchronize();
    yield this.checkExistenceInMsCalendar.perform();
  }
}

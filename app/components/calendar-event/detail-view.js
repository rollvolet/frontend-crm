import Component from '@glimmer/component';
import fetch, { Headers } from 'fetch';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';

export default class CalendarEventDetailViewComponent extends Component {
  @tracked errorMessage;

  constructor() {
    super(...arguments);
    this.checkExistenceInMsCalendar.perform();
  }

  get hasErrorInCalendar() {
    return this.errorMessage;
  }

  @keepLatestTask
  *checkExistenceInMsCalendar() {
    if (this.args.model && this.args.model.id && !this.args.model.isMasteredByAccess) {
      const response = yield fetch(`/calendar-events/${this.args.model.id}/ms-event`, {
        method: 'GET',
        headers: new Headers({
          Accept: 'application/json',
        }),
      });
      this.errorMessage = null;
      if (response.ok) {
        const json = yield response.json();
        if (json.data?.id == null) {
          this.errorMessage = 'Niet gevonden in agenda';
        }
      } else if (response.status == 409) {
        const json = yield response.json();
        const date = moment(json.data.attributes.date, 'YYYY-MM-DD').format('DD-MM-YYYY');
        this.errorMessage = `Andere datum (${date}) in agenda`;
      } else {
        this.errorMessage = 'Probleem in agenda';
      }
    } else {
      this.errorMessage = null;
    }
  }

  @keepLatestTask
  *synchronize() {
    yield this.args.onSynchronize();
    yield this.checkExistenceInMsCalendar.perform();
  }
}

import Component from '@glimmer/component';
import fetch, { Headers } from 'fetch';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { keepLatestTask } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';

export default class CalendarEventDetailViewComponent extends Component {
  errorMessage = trackedTask(this, this.checkExistenceInMsCalendar, () => [this.args.model]);

  get hasErrorInCalendar() {
    // workaround to correctly update the template
    // - this.errorMessage.value must be called such that the trackedTask gets re-executed if model updates
    // - this.checkExistenceInMsCalendar.lastSuccessful?.value is called to update if synchronize task is performed
    return this.errorMessage.value && this.checkExistenceInMsCalendar.lastSuccessful?.value;
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
      if (response.ok) {
        const json = yield response.json();
        if (json.data?.id == null) {
          return 'Niet gevonden in agenda';
        }
      } else if (response.status == 409) {
        const json = yield response.json();
        const date = format(parseISO(json.data.attributes.date), 'dd-MM-yyyy');
        return `Andere datum (${date}) in agenda`;
      } else {
        return 'Probleem in agenda';
      }
    }
    return null;
  }

  @keepLatestTask
  *synchronize() {
    yield this.args.onSynchronize();
    yield this.checkExistenceInMsCalendar.perform();
  }
}

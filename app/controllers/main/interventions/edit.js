import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';

export default class MainInterventionsEditController extends Controller {
  @service case;
  @service router;

  get isDisabledEdit() {
    return this.hasInvoice || this.model.isCancelled;
  }

  get isEnabledDelete() {
    return !this.hasInvoice && !this.model.isCancelled;
  }

  get hasInvoice() {
    return this.case.current && this.case.current.invoice != null;
  }

  @task
  *delete() {
    // TODO fetch via relation once intervention is converted to triplestore
    const calendarEvent = yield this.store.queryOne('calendar-event', {
      'filter[:exact:intervention]': this.model.uri,
    });
    try {
      if (calendarEvent) {
        yield calendarEvent.destroyRecord();
      }
      yield this.model.destroyRecord();
      this.router.transitionTo('main.interventions.index');
    } catch (e) {
      warn(`Something went wrong while destroying intervention ${this.model.id}`, {
        id: 'destroy-failure',
      });
      yield this.model.rollbackAttributes(); // undo delete-state
    }
  }
}

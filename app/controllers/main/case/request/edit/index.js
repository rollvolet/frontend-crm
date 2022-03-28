import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';

export default class MainCaseRequestEditIndexController extends Controller {
  @service case;
  @service router;

  get isDisabledEdit() {
    return this.case.current && this.case.current.offer != null;
  }

  get isEnabledDelete() {
    return this.case.current && this.case.current.offer == null;
  }

  get offer() {
    return this.case.current && this.case.current.offer;
  }

  @task
  *delete() {
    const customer = this.case.current.customer;
    try {
      // TODO fetch via relation once intervention is converted to triplestore
      const calendarEvent = yield this.store.queryOne('calendar-event', {
        'filter[:exact:request]': this.model.uri,
      });
      if (calendarEvent) {
        yield calendarEvent.destroyRecord();
      }
      yield this.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying request ${this.model.id}`, {
        id: 'destroy-failure',
      });
      yield this.model.rollbackAttributes(); // undo delete-state
    } finally {
      if (customer) {
        this.router.transitionTo('main.customers.edit', customer);
      } else {
        this.router.transitionTo('main.requests.index');
      }
    }
  }
}

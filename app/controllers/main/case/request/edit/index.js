import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { warn } from '@ember/debug';

export default class IndexController extends Controller {
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
      const calendarEvent = yield this.model.calendarEvent;
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

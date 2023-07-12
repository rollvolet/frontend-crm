import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';
import { isPresent } from '@ember/utils';

export default class MainCaseRequestEditIndexController extends Controller {
  @service router;

  get case() {
    return this.model.case;
  }

  get request() {
    return this.model.request;
  }

  get isDisabledEdit() {
    return this.case.isCancelled;
  }

  get isEnabledDelete() {
    return !this.hasOffer && !this.case.isCancelled;
  }

  get hasOffer() {
    return isPresent(this.case.offer.get('id'));
  }

  @task
  *delete() {
    const customer = yield this.case.customer;
    try {
      const visit = yield this.request.visit;
      if (visit) {
        yield visit.destroyRecord();
      }
      yield this.request.destroyRecord();
      yield this.case.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying request ${this.request.id}`, {
        id: 'destroy-failure',
      });
      yield this.request.rollbackAttributes(); // undo delete-state
    } finally {
      if (customer) {
        this.router.transitionTo('main.customers.edit.index', customer.id);
      } else {
        this.router.transitionTo('main.requests.index');
      }
    }
  }
}

import Controller from '@ember/controller';
import { service } from '@ember/service';
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
    return this.case.isOngoing && !this.hasOffer;
  }

  get hasOffer() {
    return isPresent(this.case.offer.get('id'));
  }

  @task
  *delete() {
    const customer = yield this.case.customer;
    const visit = yield this.request.visit;
    if (visit) {
      yield visit.destroyRecord();
    }
    yield this.request.destroyRecord();
    yield this.case.destroyRecord();

    if (customer) {
      this.router.transitionTo('main.customers.edit.index', customer.id);
    } else {
      this.router.transitionTo('main.requests.index');
    }
  }
}

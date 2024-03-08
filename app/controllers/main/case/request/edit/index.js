import Controller from '@ember/controller';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class MainCaseRequestEditIndexController extends Controller {
  @service router;

  // model hash alias
  get case() {
    return this.model.case;
  }

  // model hash alias
  get request() {
    return this.model.request;
  }

  @cached
  get offer() {
    return new TrackedAsyncData(this.model.case.offer);
  }

  get hasOffer() {
    return this.offer.isResolved && this.offer.value != null;
  }

  get isDisabledEdit() {
    return this.case.isCancelled;
  }

  get isEnabledDelete() {
    return this.case.isOngoing && !this.hasOffer;
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

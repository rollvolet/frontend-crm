import Controller from '@ember/controller';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';

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
}

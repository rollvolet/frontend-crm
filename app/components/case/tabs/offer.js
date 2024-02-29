import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class CaseTabsOfferComponent extends Component {
  get isNextStep() {
    return this.args.currentStep == 'request';
  }

  @cached
  get customer() {
    return new TrackedAsyncData(this.args.model.customer);
  }

  get hasLinkedCustomer() {
    return this.customer.isResolved && this.customer.value != null;
  }

  @cached
  get request() {
    return new TrackedAsyncData(this.args.model.request);
  }

  get hasRequest() {
    return this.request.isResolved && this.request.value != null;
  }

  @cached
  get offer() {
    return new TrackedAsyncData(this.args.model.offer);
  }

  get hasOffer() {
    return this.offer.isResolved && this.offer.value != null;
  }

  get canCreateNew() {
    return (
      !this.args.model.isCancelled && this.hasLinkedCustomer && this.hasRequest && !this.hasOffer
    );
  }
}

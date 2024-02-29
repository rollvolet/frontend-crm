import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked, cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';

export default class CaseTabsOrderComponent extends Component {
  @service router;

  @tracked isOpenMissingDeliveryMethodModal = false;

  get isNextStep() {
    return this.args.currentStep == 'offer';
  }

  @cached
  get customer() {
    return new TrackedAsyncData(this.args.model.customer);
  }

  get hasLinkedCustomer() {
    return this.customer.isResolved && this.customer.value != null;
  }

  @cached
  get offer() {
    return new TrackedAsyncData(this.args.model.offer);
  }

  get hasOffer() {
    return this.offer.isResolved && this.offer.value != null;
  }

  @cached
  get order() {
    return new TrackedAsyncData(this.args.model.order);
  }

  get hasOrder() {
    return this.order.isResolved && this.order.value != null;
  }

  get canCreateNew() {
    return (
      !this.args.model.isCancelled &&
      this.hasOffer &&
      !this.offer.value.isMasteredByAccess &&
      !this.hasOrder
    );
  }

  @action
  async navigateToOrderRoute() {
    const deliveryMethod = await this.args.model.deliveryMethod;
    if (deliveryMethod) {
      const offer = await this.args.model.offer;
      this.router.transitionTo('main.case.offer.edit.order', this.args.model.id, offer.id);
    } else {
      this.isOpenMissingDeliveryMethodModal = true;
    }
  }

  @action
  closeMissingDeliveryMethodModal() {
    this.isOpenMissingDeliveryMethodModal = false;
  }
}

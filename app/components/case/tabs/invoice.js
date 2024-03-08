import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked, cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';

export default class CaseTabsOrderComponent extends Component {
  @service router;

  @tracked isOpenMissingVatRateModal = false;

  get isNextStep() {
    return this.args.currentStep == 'order' || this.args.currentStep == 'intervention';
  }

  @cached
  get customer() {
    return new TrackedAsyncData(this.args.model.customer);
  }

  get hasLinkedCustomer() {
    return this.customer.isResolved && this.customer.value != null;
  }

  @cached
  get intervention() {
    return new TrackedAsyncData(this.args.model.intervention);
  }

  get hasIntervention() {
    return this.intervention.isResolved && this.intervention.value != null;
  }

  @cached
  get order() {
    return new TrackedAsyncData(this.args.model.order);
  }

  get hasOrder() {
    return this.order.isResolved && this.order.value != null;
  }

  @cached
  get invoice() {
    return new TrackedAsyncData(this.args.model.invoice);
  }

  get hasInvoice() {
    return this.invoice.isResolved && this.invoice.value != null;
  }

  get canCreateNew() {
    const canCreateNewInvoiceForOrder =
      !this.args.model.isCancelled &&
      this.hasOrder &&
      !this.hasInvoice &&
      !this.order.value.isMasteredByAccess;
    const canCreateNewInvoiceForIntervention =
      !this.args.model.isCancelled &&
      this.hasLinkedCustomer &&
      this.hasIntervention &&
      !this.hasInvoice;

    return canCreateNewInvoiceForOrder || canCreateNewInvoiceForIntervention;
  }

  @action
  async navigateToInvoiceRoute() {
    const vatRate = await this.args.model.vatRate;
    if (vatRate) {
      const order = await this.args.model.order;
      if (order) {
        this.router.transitionTo('main.case.order.edit.invoice', this.args.model.id, order.id);
      } else {
        const intervention = await this.args.model.intervention;
        this.router.transitionTo(
          'main.case.intervention.edit.invoice',
          this.args.model.id,
          intervention.id
        );
      }
    } else {
      this.isOpenMissingVatRateModal = true;
    }
  }

  @action
  closeMissingVatRateModal() {
    this.isOpenMissingVatRateModal = false;
  }
}

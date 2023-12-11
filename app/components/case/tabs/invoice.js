import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CaseTabsOrderComponent extends Component {
  @service router;

  @tracked isOpenMissingVatRateModal = false;

  get isNextStep() {
    return this.args.currentStep == 'order' || this.args.currentStep == 'intervention';
  }

  get canCreateNew() {
    const canCreateNewInvoiceForOrder =
      !this.args.model.isCancelled &&
      this.args.model.order.get('id') &&
      this.args.model.invoice.get('id') == null &&
      !this.args.model.order.get('isMasteredByAccess');
    const canCreateNewInvoiceForIntervention =
      !this.args.model.isCancelled &&
      this.args.model.customer.get('id') &&
      this.args.model.intervention.get('id') &&
      this.args.model.invoice.get('id') == null;

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

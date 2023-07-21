import Component from '@glimmer/component';

export default class CaseTabsOrderComponent extends Component {
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
}

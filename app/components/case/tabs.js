import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class CaseTabsComponent extends Component {
  @service router;
  @service store;

  constructor() {
    super(...arguments);

    this.router.on('routeDidChange', () => {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.hasAttribute('data-case-tab')) {
        document.activeElement.blur(); // unfocus tab
      }
    });
  }

  get canCreateNewOffer() {
    return (
      !this.args.model.isCancelled &&
      this.args.model.customer.get('id') &&
      this.args.model.request.get('id') &&
      this.args.model.offer.get('id') == null
    );
  }

  get canCreateNewOrder() {
    return (
      !this.args.model.isCancelled &&
      this.args.model.offer.get('id') &&
      this.args.model.order.get('id') == null &&
      !this.args.model.offer.get('isMasteredByAccess')
    );
  }

  get canCreateNewInvoice() {
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

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class CaseTabsComponent extends Component {
  @service case;
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

  get model() {
    return this.case.current;
  }

  get visitor() {
    return this.case.visitor;
  }

  get isLoading() {
    return this.case.loadCase.isRunning;
  }

  get canCreateNewOffer() {
    return (
      this.model &&
      this.model.case.customer &&
      this.model.request &&
      !this.model.request.isCancelled &&
      this.model.case.offer == null
    );
  }

  get canCreateNewOrder() {
    return (
      this.model &&
      this.model.case.offer &&
      this.model.case.order == null &&
      this.model.offer &&
      !this.model.offer.isMasteredByAccess
    );
  }

  get canCreateNewInvoice() {
    const canCreateNewInvoiceForOrder =
      this.model &&
      this.model.case.order &&
      this.model.case.invoice.get('id') == null &&
      this.model.order &&
      !this.model.order.isMasteredByAccess &&
      !this.model.order.canceled;
    const canCreateNewInvoiceForIntervention =
      this.model &&
      this.model.case.customer &&
      this.model.case.intervention &&
      this.model.case.invoice.get('id') == null &&
      !this.model.intervention.isCancelled;

    return canCreateNewInvoiceForOrder || canCreateNewInvoiceForIntervention;
  }
}

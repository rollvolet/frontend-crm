import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CaseTabsComponent extends Component {
  @service case
  @service router
  @service store

  @tracked isEditRoute

  constructor() {
    super(...arguments);
    this.case.initCase.perform();
    this.isEditRoute = this.router.currentRoute.queryParams.editMode == "true";

    this.router.on('routeWillChange', (transition) => {
      const target = transition.to.name;
      if (!target.startsWith('main.case'))
        this.case.unloadCase();
    });

    this.router.on('routeDidChange', (transition) => {
      document.activeElement.blur(); // unfocus tab
      const target = transition.to.name;
      if (target.startsWith('main.case') && this.case.isInvalid)
        this.case.initCase.perform();
      this.isEditRoute = this.router.currentRoute.queryParams.editMode == "true";
    });
  }

  get model() {
    return this.case.current;
  }

  get visitor() {
    return this.case.visitor;
  }

  get canCreateNewOffer() {
    return !this.isEditRoute
      && this.model
      && this.model.customerId
      && this.model.requestId
      && this.model.offerId == null;
  }

  get canCreateNewOrder() {
    return !this.isEditRoute
      && this.model
      && this.model.offerId
      && this.model.orderId == null
      && this.model.offer
      && !this.model.offer.isMasteredByAccess;
  }

  get canCreateNewInvoice() {
    const canCreateNewInvoiceForOrder =
          this.model
          && this.model.orderId
          && this.model.invoiceId == null
          && this.model.order
          && !this.model.order.isMasteredByAccess
          && !this.model.order.canceled;
    const canCreateNewInvoiceForIntervention =
          this.model
          && this.model.customerId
          && this.model.interventionId
          && this.model.invoiceId == null
          && !this.model.intervention.isCancelled;

    return !this.isEditRoute
      && (canCreateNewInvoiceForOrder || canCreateNewInvoiceForIntervention);
  }
}

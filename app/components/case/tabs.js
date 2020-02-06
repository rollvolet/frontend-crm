import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CaseTabsComponent extends Component {
  @service case
  @service router
  @service store

  @tracked currentRouteName
  @tracked isEditRoute

  constructor() {
    super(...arguments);
    this.case.initCase();

    // computed properties on this.router.currentRoute don't seem to work
    // hence we observe the currentRoute and derive related values manually
    this.router.addObserver('currentRoute', this, 'currentRouteChanged');
    this.currentRouteChanged(this.router, 'currentRoute'); // initialize derived values
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.router.removeObserver('currentRoute', this, 'currentRouteChanged');
  }

  // observation handler
  currentRouteChanged(sender, key) {
    const currentRoute = sender[key];
    this.currentRouteName = currentRoute.name;
    this.isEditRoute = currentRoute.queryParams.editMode == "true";
  }

  get model() {
    return this.case.current;
  }

  get visitorName() {
    return this.model.request && this.model.request.visitor;
  }

  get visitor() {
    return this.store.peekAll('employee').find(e => e.firstName == this.visitorName);
  }

  get canCreateNewOffer() {
    return !this.isEditRoute && this.model && this.model.requestId && this.model.offerId == null;
  }

  get canCreateNewOrder() {
    return !this.isEditRoute && this.model && this.model.offerId && this.model.orderId == null && this.model.offer && !this.model.offer.isMasteredByAccess;
  }

  get canCreateNewInvoice() {
    return !this.isEditRoute && this.model && this.model.orderId && this.model.invoiceId == null && this.model.order && !this.model.order.isMasteredByAccess;
  }

  @action
  openNewOffer() {
    const customerId = this.model.customerId;
    const requestId = this.model.requestId;
    this.router.transitionTo('main.case.request.edit.offer', customerId, requestId);
  }

  @action
  openNewOrder() {
    const customerId = this.model.customerId;
    const offerId = this.model.offerId;
    this.router.transitionTo('main.case.offer.edit.order', customerId, offerId);
  }

  @action
  openNewInvoice() {
    const customerId = this.model.customerId;
    const orderId = this.model.orderId;
    this.router.transitionTo('main.case.order.edit.invoice', customerId, orderId);
  }
}

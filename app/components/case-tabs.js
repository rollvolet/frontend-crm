import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';

@classic
export default class CaseTabs extends Component {
  @service
  case;

  @service
  router;

  @service
  store;

  currentRouteName = null;
  isEditRoute = null;

  init() {
    super.init(...arguments);
    this.case.initCase();

    // computed properties on this.router.currentRoute don't seem to work
    // hence we observe the currentRoute and derive related values manually
    this.router.addObserver('currentRoute', this, 'currentRouteChanged');
    this.currentRouteChanged(this.router, 'currentRoute'); // initialize derived values
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);
    this.router.removeObserver('currentRoute', this, 'currentRouteChanged');
  }

  currentRouteChanged(sender, key) {
    const currentRoute = sender[key];
    this.set('currentRouteName', currentRoute.name);
    this.set('isEditRoute', currentRoute.queryParams.editMode == "true");
  }

  @alias('case.current')
  model;

  @alias('model.request.visitor')
  visitorName;

  @computed('visitorName')
  get visitor() {
    return this.store.peekAll('employee').find(e => e.firstName == this.visitorName);
  }

  @computed('isEditRoute', 'model', 'model.{requestId,offerId}')
  get canCreateNewOffer() {
    return !this.isEditRoute && this.model && this.model.requestId && this.model.offerId == null;
  }

  @computed('isEditRoute', 'model', 'model.{offerId,orderId,offer}')
  get canCreateNewOrder() {
    return !this.isEditRoute && this.model && this.model.offerId && this.model.orderId == null && this.model.offer && !this.model.offer.isMasteredByAccess;
  }

  @computed('isEditRoute', 'model', 'model.{orderId,invoiceId,order}')
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

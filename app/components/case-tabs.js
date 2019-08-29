import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend({
  case: service(),
  router: service(),
  store: service(),

  currentRouteName: null,
  isEditRoute: null,

  init() {
    this._super(...arguments);
    this.case.initCase();

    // computed properties on this.router.currentRoute don't seem to work
    // hence we observe the currentRoute and derive related values manually
    this.router.addObserver('currentRoute', this, 'currentRouteChanged');
    this.currentRouteChanged(this.router, 'currentRoute'); // initialize derived values
  },

  willDestroyElement() {
    this._super(...arguments);
    this.router.removeObserver('currentRoute', this, 'currentRouteChanged');
  },

  currentRouteChanged(sender, key) {
    const currentRoute = sender[key];
    this.set('currentRouteName', currentRoute.name);
    this.set('isEditRoute', currentRoute.queryParams.editMode == "true");
  },

  model: alias('case.current'),
  visitorName: alias('model.request.visitor'),
  visitor: computed('visitorName', function() {
    return this.store.peekAll('employee').find(e => e.firstName == this.visitorName);
  }),

  canCreateNewOffer: computed('isEditRoute', 'model', 'model.{requestId,offerId}', function() {
    return !this.isEditRoute && this.model && this.model.requestId && this.model.offerId == null;
  }),
  canCreateNewOrder: computed('isEditRoute', 'model', 'model.{offerId,orderId,offer}', function() {
    return !this.isEditRoute && this.model && this.model.offerId && this.model.orderId == null && this.model.offer && !this.model.offer.isMasteredByAccess;
  }),
  canCreateNewInvoice: computed('isEditRoute', 'model', 'model.{orderId,invoiceId,order}', function() {
    return !this.isEditRoute && this.model && this.model.orderId && this.model.invoiceId == null && this.model.order && !this.model.order.isMasteredByAccess;
  }),

  actions: {
    openNewOffer() {
      const customerId = this.model.customerId;
      const requestId = this.model.requestId;
      this.router.transitionTo('main.case.request.edit.offer', customerId, requestId);
    },
    openNewOrder() {
      const customerId = this.model.customerId;
      const offerId = this.model.offerId;
      this.router.transitionTo('main.case.offer.edit.order', customerId, offerId);
    },
    openNewInvoice() {
      const customerId = this.model.customerId;
      const orderId = this.model.orderId;
      this.router.transitionTo('main.case.order.edit.invoice', customerId, orderId);
    }
  }
});

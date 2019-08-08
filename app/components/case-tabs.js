import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias, oneWay } from '@ember/object/computed';

export default Component.extend({
  case: service(),
  router: service(),
  store: service(),

  init() {
    this._super(...arguments);
    this.case.initCase();
  },

  model: alias('case.current'),
  visitorName: alias('model.request.visitor'),
  visitor: computed('visitorName', function() {
    return this.store.peekAll('employee').find(e => e.firstName == this.visitorName);
  }),
  currentRouteName: oneWay('router.currentRouteName'),

  canCreateNewOffer: computed('model', 'model.{requestId,offerId}', function() {
    return this.model && this.model.requestId && this.model.offerId == null;
  }),
  canCreateNewOrder: computed('model', 'model.{offerId,orderId,offer}', function() {
    return this.model && this.model.offerId && this.model.orderId == null && this.model.offer && !this.model.offer.isMasteredByAccess;
  }),
  canCreateNewInvoice: computed('model', 'model.{orderId,invoiceId,order}', function() {
    return this.model && this.model.orderId && this.model.invoiceId == null && this.model.order && !this.model.order.isMasteredByAccess;
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

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { alias, oneWay } from '@ember/object/computed';

export default Component.extend({
  case: service(),
  router: service(),

  init() {
    this._super(...arguments);
    this.case.initCase();
  },

  model: alias('case.current'),
  currentRouteName: oneWay('router.currentRouteName'),
  routeChanged: observer('router.currentRouteName', function() {
    this.set('currentRouteName', this.get('router.currentRouteName'));
  }),

  hasNextStepOffer: computed('model', 'model.{requestId,offerId}', function() {
    return this.model && this.model.requestId && this.model.offerId == null;
  }),
  hasNextStepOrder: computed('model', 'model.{offerId,orderId}', function() {
    return this.model && this.model.offerId && this.model.orderId == null;
  }),

  actions: {
    openNewOffer() {
      const customerId = this.model.customerId;
      const requestId = this.model.requestId;
      this.router.transitionTo('main.case.request.edit.offer', customerId, requestId);
    },
    openNewOrder() {
      console.log('Not implemented yet');
    }
  }
});

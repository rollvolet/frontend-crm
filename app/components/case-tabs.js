import { computed } from '@ember/object';
import { observer } from '@ember/object';
import { assert } from '@ember/debug';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { oneWay } from '@ember/object/computed';
import Case from '../models/case';

const regexMap = {
  requestId: /case\/\d+\/request\/(\d+)/i,
  offerId: /case\/\d+\/offer\/(\d+)/i,
  orderId: /case\/\d+\/order\/(\d+)/i,
  invoiceId: /case\/\d+\/invoice\/(\d+)/i
};

const calcQueryParam = function(routeUrl, key) {
  const regex = regexMap[key];
  const matches = routeUrl.match(regex);
  assert("Expected 1 full match and 1 group capture", matches && matches.length == 2);
  return `${key}=${matches[1]}`;
};

export default Component.extend({
  router: service(),
  session: service(),
  ajax: service(),

  currentRouteName: oneWay('router.currentRouteName'),
  routeChanged: observer('router.currentRouteName', function() {
    this.set('currentRouteName', this.get('router.currentRouteName'));
  }),
  currentUrl: oneWay('router.currentURL'),

  async init() {
    this._super(...arguments);

    const currentRoute = this.get('currentRouteName');
    const currentUrl = this.get('currentUrl');

    let queryParam;
    if (currentRoute.includes('case.request'))
      queryParam = calcQueryParam(currentUrl, 'requestId');
    else if (currentRoute.includes('case.offer'))
      queryParam = calcQueryParam(currentUrl, 'offerId');
    else if (currentRoute.includes('case.order'))
      queryParam = calcQueryParam(currentUrl, 'orderId');
    else if (currentRoute.includes('case.invoice'))
      queryParam = calcQueryParam(currentUrl, 'invoiceId');

    const { access_token } = this.get('session.data.authenticated');
    const headers = { 'Authorization': `Bearer ${access_token}` };
    const response = await this.get('ajax').request(`/api/cases?${queryParam}`, { headers });
    const model = Case.create({
      customerId: response.customerId,
      requestId: response.requestId,
      offerId: response.offerId,
      orderId: response.orderId,
      invoiceId: response.invoiceId
    });
    this.set('model', model);
  },

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

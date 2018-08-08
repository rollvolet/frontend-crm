import Service, { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
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

export default Service.extend({
  current: null,

  router: service(),
  session: service(),
  ajax: service(),

  async init() {
    this._super(...arguments);
    await this.initCase();
  },

  async initCase() {
    const currentCase = await this.loadCaseForCurrentRoute();
    this.set('current', currentCase);
  },

  async loadCaseForCurrentRoute() {
    const currentRoute = this.get('router.currentRouteName');
    const currentUrl = this.get('router.currentURL');

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
    const response = await this.ajax.request(`/api/cases?${queryParam}`, { headers });
    return Case.create({
      customerId: response.customerId,
      requestId: response.requestId,
      offerId: response.offerId,
      orderId: response.orderId,
      invoiceId: response.invoiceId
    });
  }
});

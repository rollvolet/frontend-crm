import { assert } from '@ember/debug';
import Component from '@ember/component';
import { inject } from '@ember/service';
import { oneWay } from '@ember/object/computed';

const regexMap = {
  requestId: /case\/\d+\/request\/(\d+)/i,
  offerId: /case\/\d+\/offer\/(\d+)/i,
  orderId: /case\/\d+\/order\/(\d+)/i,
  invoiceId: /case\/\d+\/invoice\/(\d+)/i
};

const calcQueryParam = function(routeUrl, key) {
  const regex = regexMap[key];
  const matches = routeUrl.match(regex);
  assert("Expected 1 full match and 1 group capture", matches.length == 2);
  return `${key}=${matches[1]}`;
};

export default Component.extend({
  router: inject(),
  session: inject(),
  ajax: inject(),
  currentRouteName: oneWay('router.currentRouteName'),
  currentUrl: oneWay('router.currentURL'),
  init() {
    this._super(...arguments);

    const currentRoute = this.get('currentRouteName');
    const currentUrl = this.get('currentUrl');

    let queryParam;
    if (currentRoute.endsWith('case.request'))
      queryParam = calcQueryParam(currentUrl, 'requestId');
    else if (currentRoute.endsWith('case.offer'))
      queryParam = calcQueryParam(currentUrl, 'offerId');
    else if (currentRoute.includes('case.order'))
      queryParam = calcQueryParam(currentUrl, 'orderId');
    else if (currentRoute.endsWith('case.invoice'))
      queryParam = calcQueryParam(currentUrl, 'invoiceId');

    this.get('session').authorize('authorizer:oauth2', (headerName, headerValue) => {
      const headers = {};
      headers[headerName] = headerValue;

      this.get('ajax').request(`/api/cases?${queryParam}`, { headers: headers })
        .then((response) => this.set('case', response));
    });
  }
});

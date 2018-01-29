import Component from '@ember/component';
import { inject } from '@ember/service';
import { oneWay } from '@ember/object/computed';

export default Component.extend({
  router: inject(),
  session: inject(),
  ajax: inject(),
  currentRouteName: oneWay('router.currentRouteName'),
  currentUrl: oneWay('router.currentURL'),
  init() {
    this._super(...arguments);
    const id = this.get('currentUrl').substr(this.get('currentUrl').lastIndexOf('/') + 1);
    let queryParam;
    if (this.get('currentRouteName').endsWith("case.request"))
      queryParam = `requestId=${id}`;
    else if (this.get('currentRouteName').endsWith("case.offer"))
      queryParam = `offerId=${id}`;
    else if (this.get('currentRouteName').endsWith("case.order"))
      queryParam = `orderId=${id}`;
    else if (this.get('currentRouteName').endsWith("case.invoice"))
      queryParam = `invoiceId=${id}`;

    this.get('session').authorize('authorizer:oauth2', (headerName, headerValue) => {
      const headers = {};
      headers[headerName] = headerValue;

      this.get('ajax').request(`/cases?${queryParam}`, { headers: headers })
        .then((response) => this.set('case', response));
    });
  }
});

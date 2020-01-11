import classic from 'ember-classic-decorator';
import Service, { inject as service } from '@ember/service';
import fetch, { Headers } from 'fetch';
import { assert } from '@ember/debug';
import Case from '../models/case';
import { task } from 'ember-concurrency';
import Evented from '@ember/object/evented';

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

@classic
export default class CaseService extends Service.extend(Evented) {
  current = null;

  @service
  router;

  @service
  session;

  @service
  store;

  init() {
    super.init(...arguments);
    this.initCase();
  }

  async initCase() {
    const currentCase = await this.loadCaseForCurrentRoute.perform();
    this.set('current', currentCase);
    await this.loadRecords.perform();
  }

  updateRecord(type, record) {
    this.set(`current.${type}`, record);
    this.set(`current.${type}Id`, record && record.get('id'));
  }

  @(task(function * () {
    const promises = ['request', 'offer', 'order', 'invoice'].map(async (type) => {
      const idProp = `${type}Id`;
      const currentId = this.current.get(idProp);
      const currentResource = this.current.get(type);
      if ( (currentId && !currentResource)
           || (currentId && currentResource && currentId != currentResource.get('id'))) {
        let record = this.store.peekRecord(type, currentId);

        if (!record)
          record = await this.store.findRecord(type, currentId);

        this.set(`current.${type}`, record);
      }
    });

    yield Promise.all(promises);
  }).keepLatest())
  loadRecords;

  @task(function * () {
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
    const response = yield fetch(`/api/cases?${queryParam}`, {
      method: 'GET',
      headers: new Headers({
        Authorization: `Bearer ${access_token}`
      })
    });

    if (response.ok) {
      const responseBody = yield response.json();
      return Case.create({
        customerId: responseBody.customerId,
        requestId: responseBody.requestId,
        offerId: responseBody.offerId,
        orderId: responseBody.orderId,
        invoiceId: responseBody.invoiceId
      });
    } else {
      throw response;
    }
  })
  loadCaseForCurrentRoute;

  @task(function * (contact, building) {
    yield this._updateContactAndBuilding.perform(contact, building);

    const reloadPromises = [];
    if (this.current.request) {
      reloadPromises.push(this.current.request.belongsTo('contact').reload());
      reloadPromises.push(this.current.request.belongsTo('calendarEvent').reload());
    }
    if (this.current.offer) {
      reloadPromises.push(this.current.offer.belongsTo('contact').reload());
    }
    if (this.current.order) {
      reloadPromises.push(this.current.order.belongsTo('contact').reload());

      const depositInvoices = yield this.current.order.get('depositInvoices');
      depositInvoices.forEach( depositInvoice => {
        reloadPromises.push(depositInvoice.belongsTo('contact').reload());
      });
    }
    if (this.current.invoice) {
      reloadPromises.push(this.current.invoice.belongsTo('contact').reload());
    }

    yield Promise.all(reloadPromises);
  })
  updateContact;

  @(task(function * (contact, building) {
    yield this._updateContactAndBuilding.perform(contact, building);

    const reloadPromises = [];
    if (this.current.request) {
      reloadPromises.push(this.current.request.belongsTo('building').reload());
      reloadPromises.push(this.current.request.belongsTo('calendarEvent').reload());
    }
    if (this.current.offer) {
      reloadPromises.push(this.current.offer.belongsTo('building').reload());
    }
    if (this.current.order) {
      reloadPromises.push(this.current.order.belongsTo('building').reload());

      const depositInvoices = yield this.current.order.get('depositInvoices');
      depositInvoices.forEach( depositInvoice => {
        reloadPromises.push(depositInvoice.belongsTo('building').reload());
      });
    }
    if (this.current.invoice) {
      reloadPromises.push(this.current.invoice.belongsTo('building').reload());
    }

    yield Promise.all(reloadPromises);
  }).evented())
  updateBuilding;

  @task(function * (contact, building) {
    const { access_token } = this.get('session.data.authenticated');
    yield fetch(`/api/cases/contact-and-building`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }),
      body: JSON.stringify({
        contactId: contact && contact.get('id'),
        buildingId: building && building.get('id'),
        requestId: this.current.requestId,
        offerId: this.current.offerId,
        orderId: this.current.orderId,
        invoiceId: this.current.invoiceId
      })
    });
  })
  _updateContactAndBuilding;
}

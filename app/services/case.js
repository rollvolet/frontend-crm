import Service, { inject as service } from '@ember/service';
import fetch, { Headers } from 'fetch';
import { assert, warn } from '@ember/debug';
import Case from '../models/case';
import { keepLatestTask, task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import Evented from '@ember/object/evented';
import { tracked } from '@glimmer/tracking';

const regexMap = {
  unlinkedRequestId: /requests\/(\d+)/i,
  requestId: /case\/\d+\/request\/(\d+)/i,
  offerId: /case\/\d+\/offer\/(\d+)/i,
  orderId: /case\/\d+\/order\/(\d+)/i,
  invoiceId: /case\/\d+\/invoice\/(\d+)/i
};

const calcQueryParam = function(routeUrl, key, regexKey) {
  if (!regexKey) regexKey = key;
  const regex = regexMap[regexKey];
  const matches = routeUrl.match(regex);
  assert("Expected 1 full match and 1 group capture", matches && matches.length == 2);
  return `${key}=${matches[1]}`;
};

export default class CaseService extends Service.extend(Evented) {
  @service router
  @service session
  @service store

  @tracked current = null

  get visitorName() {
    return this.current.request && this.current.request.visitor;
  }

  get visitor() {
    return this.store.peekAll('employee').find(e => e.firstName == this.visitorName);
  }

  get isLoadingCurrentCase() {
    return this.loadCaseForCurrentRoute.isRunning || this.loadRecords.isRunning;
  }

  async initCase() {
    this.current = await this.loadCaseForCurrentRoute.perform();
    await this.loadRecords.perform();
  }

  updateRecord(type, record) {
    this.current[type] = record;
    this.current[`${type}Id`] = record && record.get('id');
  }

  @keepLatestTask()
  *loadCaseForCurrentRoute() {
    const currentRoute = this.router.currentRouteName;
    const currentUrl = this.router.currentURL;

    let queryParam;
    if (currentRoute.includes('requests.edit'))
      queryParam = calcQueryParam(currentUrl, 'requestId', 'unlinkedRequestId');
    else if (currentRoute.includes('case.request'))
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
      return new Case({
        customerId: responseBody.customerId,
        contactId: responseBody.contactId,
        buildingId: responseBody.buildingId,
        requestId: responseBody.requestId,
        offerId: responseBody.offerId,
        orderId: responseBody.orderId,
        invoiceId: responseBody.invoiceId
      });
    } else {
      throw response;
    }
  }

  @keepLatestTask()
  *loadRecords() {
    const isRecordLoaded = function(currentId, currentResource) {
      return currentId && currentResource && currentId == currentResource.id;
    };

    const promises = ['customer', 'contact', 'building', 'request', 'offer', 'order', 'invoice'].map(async (type) => {
      const idProp = `${type}Id`;
      const currentId = this.current[idProp];
      const currentResource = this.current[type];

      if (currentId) {
        if (!isRecordLoaded(currentId, currentResource)) {
          let record = this.store.peekRecord(type, currentId);

          if (!record)
            record = await this.store.loadRecord(type, currentId);

          this.current[type] = record;
        }
      } else {
        this.current[type] = null;
      }
    });

    yield all(promises);
  }

  @task
  *unlinkCustomer() {
    if (this.current.offer) {
      warn(`Unable to unlink customer. Case has an offer already`);
    } else if (this.current.request) {
      if (this.current.contact || this.current.building) {
        yield this._updateContactAndBuilding.perform(null, null);
        this.current.contact = null;
        this.current.building = null;
      }

      this.current.request.customer = null;
      yield this.current.request.save();
      this.current.customer = null;
    }
  }

  @task
  *updateContact(contact) {
    this.updateRecord('contact', contact);
    yield this._updateContactAndBuilding.perform(contact, this.current.building);

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
  }

  @task({ evented: true })
  *updateBuilding(building) {
    this.updateRecord('building', building);
    yield this._updateContactAndBuilding.perform(this.current.contact, building);

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
  }

  @task
  *_updateContactAndBuilding(contact, building) {
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
  }
}

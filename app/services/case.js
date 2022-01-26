import Service, { inject as service } from '@ember/service';
import fetch, { Headers } from 'fetch';
import { assert, warn } from '@ember/debug';
import CaseDispatcher from '../models/case-dispatcher';
import { all, keepLatestTask, task } from 'ember-concurrency';
import Evented from '@ember/object/evented';
import { tracked } from '@glimmer/tracking';
import updateContactAndBuildingRequest from '../utils/api/update-contact-and-building';

const regexMap = {
  unlinkedRequestId: /requests\/(\d+)/i,
  unlinkedInterventionId: /interventions\/(\d+)/i,
  requestId: /case\/\d+\/request\/(\d+)/i,
  interventionId: /case\/\d+\/intervention\/(\d+)/i,
  offerId: /case\/\d+\/offer\/(\d+)/i,
  orderId: /case\/\d+\/order\/(\d+)/i,
  invoiceId: /case\/\d+\/invoice\/(\d+)/i,
};

const calcQueryParam = function (routeUrl, key, regexKey) {
  if (!regexKey) regexKey = key;
  const regex = regexMap[regexKey];
  const matches = routeUrl.match(regex);
  assert('Expected 1 full match and 1 group capture', matches && matches.length == 2);
  return `${key}=${matches[1]}`;
};

export default class CaseService extends Service.extend(Evented) {
  @service router;
  @service store;

  @tracked isInvalid = false;
  @tracked current = null; // case-dispatcher

  get visitorName() {
    return this.current && this.current.request && this.current.request.visitor;
  }

  get visitor() {
    return this.store.peekAll('employee').find((e) => e.firstName == this.visitorName);
  }

  get isLoadingCurrentCase() {
    return this.loadCaseForCurrentRoute.isRunning || this.loadRecords.isRunning;
  }

  unloadCase() {
    this.isInvalid = true;
  }

  updateRecord(type, record) {
    this.current[type] = record;
    this.current[`${type}Id`] = record && `${record.get('id')}`;
  }

  @keepLatestTask()
  *initCase() {
    this.current = null;
    this.current = yield this.loadCaseForCurrentRoute.perform();
    yield this.loadRecords.perform();
    this.isInvalid = false;
  }

  @keepLatestTask()
  *reloadCase() {
    let mustReload = false;
    if (this.isInvalid) {
      mustReload = true;
    } else if (this.current) {
      // check if route params of current route are still the same as before
      let routeParams = {};
      let routeInfo = this.router.currentRoute;
      while (routeInfo) {
        routeParams = Object.assign(routeParams, routeInfo.params);
        routeInfo = routeInfo.parent;
      }
      if (this.current.differsFrom(routeParams)) {
        mustReload = true;
      }
    }

    if (mustReload) {
      yield this.initCase.perform();
    }
  }

  @keepLatestTask()
  *loadCaseForCurrentRoute() {
    const currentRoute = this.router.currentRouteName;
    const currentUrl = this.router.currentURL;

    let queryParam;
    if (currentRoute.includes('requests.edit'))
      queryParam = calcQueryParam(currentUrl, 'requestId', 'unlinkedRequestId');
    else if (currentRoute.includes('interventions.edit'))
      queryParam = calcQueryParam(currentUrl, 'interventionId', 'unlinkedInterventionId');
    else if (currentRoute.includes('case.request'))
      queryParam = calcQueryParam(currentUrl, 'requestId');
    else if (currentRoute.includes('case.intervention'))
      queryParam = calcQueryParam(currentUrl, 'interventionId');
    else if (currentRoute.includes('case.offer'))
      queryParam = calcQueryParam(currentUrl, 'offerId');
    else if (currentRoute.includes('case.order'))
      queryParam = calcQueryParam(currentUrl, 'orderId');
    else if (currentRoute.includes('case.invoice'))
      queryParam = calcQueryParam(currentUrl, 'invoiceId');

    const response = yield fetch(`/api/cases/current?${queryParam}`, {
      headers: new Headers({
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      }),
    });

    if (response.ok) {
      const responseBody = yield response.json();
      return new CaseDispatcher({
        customerId: responseBody.customerId && `${responseBody.customerId}`,
        contactId: responseBody.contactId && `${responseBody.contactId}`,
        buildingId: responseBody.buildingId && `${responseBody.buildingId}`,
        requestId: responseBody.requestId && `${responseBody.requestId}`,
        interventionId: responseBody.interventionId && `${responseBody.interventionId}`,
        offerId: responseBody.offerId && `${responseBody.offerId}`,
        orderId: responseBody.orderId && `${responseBody.orderId}`,
        invoiceId: responseBody.invoiceId && `${responseBody.invoiceId}`,
      });
    } else {
      throw response;
    }
  }

  @keepLatestTask()
  *loadRecords() {
    const isRecordLoaded = function (currentId, currentResource) {
      return currentId && currentResource && currentId == currentResource.id;
    };

    const promises = [
      'customer',
      'contact',
      'building',
      'request',
      'intervention',
      'offer',
      'order',
      'invoice',
    ].map(async (type) => {
      const idProp = `${type}Id`;
      const currentId = this.current[idProp];
      const currentResource = this.current[type];

      if (currentId) {
        if (!isRecordLoaded(currentId, currentResource)) {
          let record = this.store.peekRecord(type, currentId);

          if (!record) {
            record = await this.store.findRecord(type, currentId);
          }

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
    if (this.current.request) {
      if (this.current.offer) {
        warn(`Unable to unlink customer from request. Case has an offer already.`);
      } else {
        try {
          const calendarEvent = yield this.current.request.calendarEvent;
          if (calendarEvent) {
            this.current.request.requiresVisit = false;
            yield calendarEvent.destroyRecord();
          }
        } catch (e) {
          // silently ignore calendar event error
        }

        if (this.current.contact || this.current.building) {
          yield this._updateContactAndBuilding.perform(null, null);
          this.current.contact = null;
          this.current.building = null;
        }

        this.current.request.customer = null;
        yield this.current.request.save();
        this.current.customer = null;
      }
    } else if (this.current.intervention) {
      if (this.current.invoice) {
        warn(`Unable to unlink customer from intervention. Case has an invoice already.`);
      } else {
        if (this.current.contact || this.current.building) {
          yield this._updateContactAndBuilding.perform(null, null);
          this.current.contact = null;
          this.current.building = null;
        }

        this.current.intervention.customer = null;
        yield this.current.intervention.save();
        this.current.customer = null;
      }
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
      depositInvoices.forEach((depositInvoice) => {
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
      depositInvoices.forEach((depositInvoice) => {
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
    const body = {
      contactId: contact && `${contact.get('id')}`,
      buildingId: building && `${building.get('id')}`,
      requestId: this.current.requestId,
      interventionId: this.current.interventionId,
      offerId: this.current.offerId,
      orderId: this.current.orderId,
      invoiceId: this.current.invoiceId,
    };
    yield updateContactAndBuildingRequest(body);
  }
}

import Service, { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { all, keepLatestTask, task } from 'ember-concurrency';
import Evented from '@ember/object/evented';
import { tracked } from '@glimmer/tracking';
import updateContactAndBuildingRequest from '../utils/api/update-contact-and-building';
import { setCalendarEventProperties } from '../utils/calendar-helpers';

function getLegacyIdFromUri(uri) {
  if (uri && uri.includes('/')) {
    return uri.slice(uri.lastIndexOf('/') + 1);
  } else {
    return null;
  }
}

export default class CaseService extends Service.extend(Evented) {
  @service router;
  @service store;

  @tracked current = null;

  get visitorName() {
    return this.current && this.current.request && this.current.request.visitor;
  }

  get visitor() {
    return this.store.peekAll('employee').find((e) => e.firstName == this.visitorName);
  }

  get isLoadingCurrentCase() {
    return this.loadCase.isRunning;
  }

  @keepLatestTask()
  *loadCase(_case) {
    this.current = { case: _case };

    const isRecordLoaded = function (currentId, currentResource) {
      return currentId && currentResource && currentId == currentResource.id;
    };

    // TODO add deposit-invoices
    const loadRelatedRecords = [
      'customer',
      'contact',
      'building',
      'request',
      'intervention',
      'offer',
      'order',
      'invoice',
    ].map(async (type) => {
      const uriProp = `${type}Uri`;
      const idProp = `${type}Id`;

      const currentUri = _case[type];
      const currentResource = this.current[type];

      if (currentUri) {
        // set uri on current
        this.current[uriProp] = currentUri;

        // set legacy id on current
        const currentId = getLegacyIdFromUri(currentUri);
        this.current[idProp] = currentId;

        // set related record on current
        if (!isRecordLoaded(currentId, currentResource)) {
          let record = this.store.peekRecord(type, currentId);

          if (!record) {
            record = await this.store.findRecord(type, currentId);
          }

          this.current[type] = record;
        }
      } else {
        this.current[uriProp] = null;
        this.current[idProp] = null;
        this.current[type] = null;
      }
    });

    yield all(loadRelatedRecords);
  }

  unloadCase() {
    this.current = null;
  }

  updateRecord(type, record) {
    this.current[type] = record;
    this.current[`${type}Uri`] = record && `${record.get('uri')}`;
    this.current[`${type}Id`] = record && `${record.get('id')}`;
  }

  @task
  *unlinkCustomer() {
    if (this.current.request) {
      if (this.current.offer) {
        warn(`Unable to unlink customer from request. Case has an offer already.`);
      } else {
        try {
          // TODO fetch via relation once request is converted to triplestore
          const calendarEvent = yield this.store.queryOne('calendar-event', {
            'filter[:exact:request]': this.current.request.uri,
          });
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
        // TODO fetch via relation once intervention is converted to triplestore
        const calendarEvent = yield this.store.queryOne('calendar-event', {
          'filter[:exact:intervention]': this.current.intervention.uri,
        });
        if (calendarEvent) {
          yield calendarEvent.destroyRecord();
          this.current.intervention.planningDate = null;
        }

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
    const calendarEvents = {};

    if (this.current.requestId) {
      // TODO fetch via relation once request is converted to triplestore
      calendarEvents['request'] = yield this.store.queryOne('calendar-event', {
        'filter[:exact:request]': this.current.request.uri,
      });
    }
    if (this.current.interventionId) {
      // TODO fetch via relation once intervention is converted to triplestore
      calendarEvents['intervention'] = yield this.store.queryOne('calendar-event', {
        'filter[:exact:intervention]': this.current.intervention.uri,
      });
    }
    if (this.current.orderId) {
      // TODO fetch via relation once order is converted to triplestore
      calendarEvents['order'] = yield this.store.queryOne('calendar-event', {
        'filter[:exact:order]': this.current.order.uri,
      });
    }

    const promises = Object.keys(calendarEvents).map(async (key) => {
      const calendarEvent = calendarEvents[key];
      if (calendarEvent) {
        await setCalendarEventProperties(calendarEvent, {
          [key]: this.current[key],
          customer: this.current.customer,
          building: this.current.building,
          visitor: this.visitor,
        });
        return calendarEvent.save();
      } else {
        return null;
      }
    });
    yield Promise.all(promises);

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

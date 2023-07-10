import Service, { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { keepLatestTask, task } from 'ember-concurrency';
import Evented from '@ember/object/evented';
import { tracked } from '@glimmer/tracking';
import updateContactAndBuildingRequest from '../utils/api/update-contact-and-building';
import { setCalendarEventProperties } from '../utils/calendar-helpers';
import CaseDispatcher from '../models/case-dispatcher';
import { createContactSnapshot, createBuildingSnapshot } from '../utils/invoice-helpers';

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

  /**
   * Loads the related records for a given case and assigns them on this.current.
   *
   * this.current looks like:
   * {
   *     case: <case-ember-data-record>,
   *     customer: <customer-ember-data-record>,
   *     ...
   *     request: <request-ember-data-record>,
   *     ...
   * }
   *
   * At the moment the case data record only contains the URIs of the related records as attributes.
   * In the long run all these records will be defined as relationships on the case data record.
   * As of then they can be loaded as regular Ember Data relationships on this.current.case
   * and tracked properties on this.current will become deprecated.
   */
  @keepLatestTask()
  *loadCase(_case) {
    this.current = new CaseDispatcher(_case, (type, id) => this.fetchRecord(type, id));
    yield this.current.loadRelatedRecords.perform();
  }

  unloadCase() {
    this.current = null;
  }

  async fetchRecord(type, id) {
    let record = this.store.peekRecord(type, id);
    if (!record) {
      record = await this.store.findRecord(type, id);
    }
    return record;
  }

  @task
  *unlinkCustomer() {
    if (this.current.case.request) {
      if (this.current.case.offer) {
        warn(`Unable to unlink customer from request. Case has an offer already.`);
      } else {
        try {
          // TODO fetch via relation once request is converted to triplestore
          const calendarEvent = yield this.store.queryOne('calendar-event', {
            'filter[:exact:request]': this.current.case.request,
          });
          if (calendarEvent) {
            yield calendarEvent.destroyRecord();
          }
        } catch (e) {
          // silently ignore calendar event error
        }

        yield this.current.unlinkCustomer();
      }
    } else if (this.current.case.intervention) {
      const invoice = yield this.current.case.invoice;
      if (invoice) {
        warn(`Unable to unlink customer from intervention. Case has an invoice already.`);
      } else {
        try {
          // TODO fetch via relation once intervention is converted to triplestore
          const calendarEvent = yield this.store.queryOne('calendar-event', {
            'filter[:exact:intervention]': this.current.case.intervention,
          });
          if (calendarEvent) {
            yield calendarEvent.destroyRecord();
            this.current.intervention.planningDate = null;
          }
        } catch (e) {
          // silently ignore calendar event error
        }

        yield this.current.unlinkCustomer();
      }
    }
  }

  @task
  *updateContact(contact) {
    yield this.current.updateRecord('contact', contact);
    yield this._updateContactAndBuilding.perform(contact, this.current.building);

    const reloadPromises = [];
    if (this.current.request) {
      reloadPromises.push(this.current.request.belongsTo('contact').reload());
    }
    if (this.current.intervention) {
      reloadPromises.push(this.current.intervention.belongsTo('contact').reload());
    }

    yield Promise.all(reloadPromises);
  }

  @task({ evented: true })
  *updateBuilding(building) {
    yield this.current.updateRecord('building', building);
    yield this._updateContactAndBuilding.perform(this.current.contact, building);

    const reloadPromises = [];
    if (this.current.request) {
      reloadPromises.push(this.current.request.belongsTo('building').reload());
    }
    if (this.current.intervention) {
      reloadPromises.push(this.current.intervention.belongsTo('building').reload());
    }

    yield Promise.all(reloadPromises);
  }

  @task
  *_updateContactAndBuilding(contact, building) {
    const calendarEvents = {};

    if (this.current.case.request) {
      // TODO fetch via relation once request is converted to triplestore
      calendarEvents['request'] = yield this.store.queryOne('calendar-event', {
        'filter[:exact:request]': this.current.case.request,
      });
    }
    if (this.current.case.intervention) {
      // TODO fetch via relation once intervention is converted to triplestore
      calendarEvents['intervention'] = yield this.store.queryOne('calendar-event', {
        'filter[:exact:intervention]': this.current.case.intervention,
      });
    }
    if (this.current.case.order) {
      calendarEvents['order'] = yield this.current.case.order.planning;
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
        try {
          await calendarEvent.save();
          return calendarEvent;
        } catch {
          // don't block building/contact update flow on calendar-event failure
          return null;
        }
      } else {
        return null;
      }
    });
    yield Promise.all(promises);

    const body = {
      contactId: contact && `${contact.get('id')}`,
      buildingId: building && `${building.get('id')}`,
      requestId: this.current.request?.id,
      interventionId: this.current.intervention?.id,
      offerId: this.current.case.offer?.id,
      orderId: this.current.case.order?.id,
      invoiceId: this.current.case.invoice?.id,
    };
    yield updateContactAndBuildingRequest(body);

    // Update contact and building snapshots of (deposit-)invoices
    const invoices = (yield Promise.all([
      this.current.case.depositInvoices,
      this.current.case.invoice,
    ])).flat();

    yield Promise.all(
      invoices.map(async (invoice) => {
        const [currentBuilding, currentContact] = await Promise.all([
          invoice.building,
          invoice.contact,
        ]);
        if (building) {
          if (currentBuilding?.source != building.uri) {
            const snapshot = await createBuildingSnapshot(building);
            invoice.building = snapshot;
          } // else: building-snapshot already up-to-date
        } else {
          invoice.building = null;
        }

        if (contact) {
          if (currentContact?.source != contact.uri) {
            const snapshot = await createContactSnapshot(contact);
            invoice.contact = snapshot;
          } // else: contact-snapshot already up-to-date
        } else {
          invoice.contact = null;
        }

        return invoice.save();
      })
    );
  }
}

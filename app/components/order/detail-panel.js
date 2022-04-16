import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debug } from '@ember/debug';
import { guidFor } from '@ember/object/internals';
import { keepLatestTask, task } from 'ember-concurrency';
import { setCalendarEventProperties } from '../../utils/calendar-helpers';
import CalendarPeriod from '../../classes/calendar-period';

export default class OrderDetailPanelComponent extends Component {
  @service case;
  @service store;

  executionOptions = [
    { label: 'te leveren', value: 'delivery', id: `delivery-${guidFor(this)}` },
    { label: 'te plaatsen', value: 'installation', id: `installation-${guidFor(this)}` },
    { label: 'af te halen', value: 'pickup', id: `pickup-${guidFor(this)}` },
  ];

  @tracked editMode = false;
  @tracked isOpenCancellationModal = false;
  @tracked calendarEvent;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    // TODO fetch via relation once order is converted to triplestore
    this.calendarEvent = yield this.store.queryOne('calendar-event', {
      'filter[:exact:order]': this.args.model.uri,
    });
  }

  get request() {
    return this.case.current && this.case.current.request;
  }

  get invoice() {
    return this.case.current && this.case.current.invoice;
  }

  get visitor() {
    return this.case.visitor;
  }

  get technicianNames() {
    return this.args.model.technicians.sortBy('firstName').mapBy('firstName');
  }

  get isNbOfPersonsWarning() {
    return this.args.model.scheduledNbOfPersons != 2;
  }

  @task
  *save() {
    const { validations } = yield this.args.model.validate();
    let requiresOfferReload = false;
    if (validations.isValid) {
      const changedAttributes = this.args.model.changedAttributes();
      const fieldsToSyncWithInvoice = ['reference', 'comment'];
      for (let field of fieldsToSyncWithInvoice) {
        if (changedAttributes[field]) {
          if (this.invoice) {
            debug(`Syncing ${field} of invoice with updated ${field} of order`);
            this.invoice[field] = this.args.model[field];
            yield this.invoice.save();
          }
          requiresOfferReload = true;
        }
      }
      yield this.args.model.save();

      if (
        changedAttributes['scheduledNbOfPersons'] ||
        changedAttributes['scheduledNbOfHours'] ||
        changedAttributes['comment']
      ) {
        // for updates on technicians, synchronizeCalendarEvent is called from template
        yield this.synchronizeCalendarEvent.perform();
      }

      if (requiresOfferReload) {
        yield this.args.model.belongsTo('offer').reload();
      }
    }

    const changedAttributesOnRequest = this.request.changedAttributes();
    if (changedAttributesOnRequest['visitor']) {
      yield this.request.save();
    }
  }

  @keepLatestTask
  *updateCalendarEventSubject(calendarPeriod) {
    yield setCalendarEventProperties(this.calendarEvent, {
      order: this.args.model,
      customer: this.case.current.customer,
      building: this.case.current.building,
      visitor: this.case.visitor,
      calendarPeriod,
    });
    yield this.saveCalendarEvent.perform();
  }

  @keepLatestTask
  *synchronizeCalendarEvent() {
    yield setCalendarEventProperties(this.calendarEvent, {
      order: this.args.model,
      customer: this.case.current.customer,
      building: this.case.current.building,
      visitor: this.case.visitor,
    });
    if (!this.calendarEvent.isNew) {
      // only save if it has already been saved before (by selecting a date/period)
      yield this.saveCalendarEvent.perform();
    }
  }

  @keepLatestTask
  *saveCalendarEvent() {
    const { validations } = yield this.calendarEvent.validate();
    if (validations.isValid) {
      yield this.calendarEvent.save();
      // TODO remove once orders are converted to triplestore and
      // link with calendar-event can be established
      const planningDateRequiresUpdate =
        this.args.model.planningDate?.toISOString() != this.calendarEvent.date?.toISOString();
      if (planningDateRequiresUpdate) {
        this.args.model.planningDate = this.calendarEvent.date;
        yield this.args.model.save();
      }
    }
  }

  async ensureCalendarEvent() {
    if (!this.calendarEvent) {
      this.calendarEvent = this.store.createRecord('calendar-event', {
        order: this.args.model.uri,
        date: null, // ember-flatpickr cannot handle 'undefined'
      });
      await setCalendarEventProperties(this.calendarEvent, {
        order: this.args.model,
        customer: this.case.current.customer,
        building: this.case.current.building,
        visitor: this.case.visitor,
        calendarPeriod: new CalendarPeriod('GD'),
      });
      // don't save calendar-event yet. It's just a placeholder to fill in the form.
    }
  }

  @keepLatestTask
  *deleteCalendarEvent() {
    // TODO remove planningDate on order
    // once order are converted to triplestore and
    // link with calendar-event can be established
    this.args.model.planningDate = null;
    yield this.args.model.save();
    yield this.calendarEvent.destroyRecord();
    this.calendarEvent = null;
    yield this.ensureCalendarEvent();
  }

  @action
  setExecution(event) {
    const execution = event.target.value;
    this.args.model.mustBeInstalled = false;
    this.args.model.mustBeDelivered = false;

    if (execution == 'installation') {
      this.args.model.mustBeInstalled = true;
    } else if (execution == 'delivery') {
      this.args.model.mustBeDelivered = true;
    }
  }

  @action
  async setCancelledStatus(value) {
    this.args.model.canceled = value;
    if (!value) {
      this.args.model.cancellationReason = null;
      await this.save.perform();
    } else {
      this.isOpenCancellationModal = true;
    }
  }

  @action
  async closeCancellationModal() {
    this.isOpenCancellationModal = false;
    this.args.model.canceled = false;
    this.args.model.cancellationReason = null;
    await this.save.perform();
  }

  @action
  async confirmCancellation(reason) {
    this.isOpenCancellationModal = false;
    this.args.model.canceled = true;
    this.args.model.cancellationReason = reason;
    await this.save.perform();
    this.closeEdit();
  }

  @action
  setVisitor(visitor) {
    this.request.visitor = visitor ? visitor.firstName : null;
  }

  @action
  setTechnicians(employees) {
    this.args.model.technicians = employees;
  }

  @action
  async openEdit() {
    await this.ensureCalendarEvent();
    this.editMode = true;
  }

  @action
  async closeEdit() {
    this.editMode = false;
    if (this.calendarEvent && this.calendarEvent.isNew) {
      await this.calendarEvent.destroyRecord();
      this.calendarEvent = null;
    }
  }
}

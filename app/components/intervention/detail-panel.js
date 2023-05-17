import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { keepLatestTask, task } from 'ember-concurrency';
import { setCalendarEventProperties } from '../../utils/calendar-helpers';
import CalendarPeriod from '../../classes/calendar-period';

export default class InterventionDetailPanelComponent extends Component {
  @service case;
  @service router;
  @service store;
  @service documentGeneration;

  @tracked editMode = false;
  @tracked isOpenOptionsMenu = false;
  @tracked isOpenCancellationModal = false;
  @tracked calendarEvent;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    // TODO fetch via relation once intervention is converted to triplestore
    this.calendarEvent = yield this.store.queryOne('calendar-event', {
      'filter[:exact:intervention]': this.args.model.uri,
    });
  }

  get technicianNames() {
    return this.args.model.technicians.sortBy('firstName').mapBy('firstName');
  }

  get isNbOfPersonsWarning() {
    return this.args.model.nbOfPersons != 2;
  }

  get isLinkedToCustomer() {
    return this.case.current && this.case.current.customer != null;
  }

  get hasInvoice() {
    return this.case.current && this.case.current.invoice != null;
  }

  get hasFollowUpRequest() {
    return this.args.model.followUpRequest && this.args.model.followUpRequest.get('id');
  }

  @keepLatestTask
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid) {
      const changedAttributes = this.args.model.changedAttributes();
      if (changedAttributes['description'] || changedAttributes['nbOfPersons']) {
        // for updates on technicians, synchronizeCalendarEvent is called from template
        yield this.synchronizeCalendarEvent.perform();
      }
      yield this.args.model.save();
    }
  }

  @keepLatestTask
  *updateCalendarEventSubject(calendarPeriod) {
    if (this.calendarEvent) {
      yield setCalendarEventProperties(this.calendarEvent, {
        intervention: this.args.model,
        customer: this.case.current.customer,
        building: this.case.current.building,
        calendarPeriod,
      });
      yield this.saveCalendarEvent.perform();
    }
  }

  @keepLatestTask
  *synchronizeCalendarEvent() {
    if (this.calendarEvent) {
      yield setCalendarEventProperties(this.calendarEvent, {
        intervention: this.args.model,
        customer: this.case.current.customer,
        building: this.case.current.building,
      });
      if (!this.calendarEvent.isNew) {
        // only save if it has already been saved before (by selecting a date/period)
        yield this.saveCalendarEvent.perform();
      }
    }
  }

  @keepLatestTask
  *saveCalendarEvent() {
    const { validations } = yield this.calendarEvent.validate();
    if (validations.isValid) {
      yield this.calendarEvent.save();
      // TODO remove once interventions are converted to triplestore and
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
    if (this.isLinkedToCustomer && !this.calendarEvent) {
      this.calendarEvent = this.store.createRecord('calendar-event', {
        intervention: this.args.model.uri,
        date: null, // ember-flatpickr cannot handle 'undefined'
      });
      await setCalendarEventProperties(this.calendarEvent, {
        intervention: this.args.model,
        customer: this.case.current.customer,
        building: this.case.current.building,
        calendarPeriod: new CalendarPeriod('GD'),
      });
      // don't save calendar-event yet. It's just a placeholder to fill in the form.
    }
  }

  @keepLatestTask
  *deleteCalendarEvent() {
    // TODO remove planningDate on intervention
    // once interventions are converted to triplestore and
    // link with calendar-event can be established
    this.args.model.planningDate = null;
    yield this.args.model.save();
    yield this.calendarEvent.destroyRecord();
    this.calendarEvent = null;
    yield this.ensureCalendarEvent();
  }

  @task
  *createNewIntervention() {
    const customer = this.case.current.customer;
    const contact = this.case.current.contact;
    const building = this.case.current.building;
    const employee = yield this.args.model.employee;
    const origin = yield this.args.model.origin;
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 6);

    const intervention = this.store.createRecord('intervention', {
      date: new Date(),
      customer,
      contact,
      building,
      employee,
      origin,
    });

    yield intervention.save();

    // TODO first create case and relate to intervention once relationship is fully defined
    const _case = this.store.createRecord('case', {
      customer: customer?.uri,
      intervention: intervention.uri,
      vatRate,
    });

    yield _case.save();

    this.router.transitionTo('main.case.intervention.edit.index', _case.id, intervention.id);
  }

  @action
  generateInterventionReport() {
    return this.documentGeneration.interventionReport(this.args.model);
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

  @action
  openOptionsMenu() {
    this.isOpenOptionsMenu = true;
  }

  @action
  closeOptionsMenu() {
    this.isOpenOptionsMenu = false;
  }

  @action
  cancelIntervention() {
    this.closeOptionsMenu();
    this.isOpenCancellationModal = true;
  }

  @action
  closeCancellationModal() {
    this.isOpenCancellationModal = false;
    this.args.model.cancellationReason = null;
  }

  @action
  confirmCancellation(reason) {
    this.isOpenCancellationModal = false;
    this.args.model.cancellationReason = reason;
    this.args.model.cancellationDate = new Date();
    this.save.perform();
  }

  @action
  uncancelIntervention() {
    this.closeOptionsMenu();
    this.args.model.cancellationReason = null;
    this.args.model.cancellationDate = null;
    this.save.perform();
  }
}

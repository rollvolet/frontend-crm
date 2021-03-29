import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { keepLatestTask, task } from 'ember-concurrency-decorators';

export default class InterventionDetailPanelComponent extends Component {
  @service case;
  @service router;
  @service store;
  @service documentGeneration;

  @tracked editMode = false;
  @tracked isOpenOptionsMenu = false;
  @tracked isOpenCancellationModal = false;
  @tracked planningEvent;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.planningEvent = yield this.args.model.planningEvent;
  }

  get technicianNames() {
    return this.args.model.technicians
      .sortBy('firstName')
      .mapBy('firstName');
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
    let requiresPlanningEventReload = false;
    if (validations.isValid) {
      const changedAttributes = this.args.model.changedAttributes();
      if (changedAttributes['comment'])
        requiresPlanningEventReload = true;
      yield this.args.model.save();
    }

    if (requiresPlanningEventReload)
      yield this.args.model.belongsTo('planningEvent').reload();
  }

  @keepLatestTask
  *savePlanningEvent() {
    const { validations } = yield this.planningEvent.validate();
    if (validations.isValid)
      yield this.planningEvent.save();
  }

  @keepLatestTask
  *deletePlanningEvent() {
    this.planningEvent.period = null;
    this.planningEvent.date = null;
    yield this.savePlanningEvent.perform();
  }

  @task
  *createNewIntervention() {
    const customer = this.case.current.customer;
    const contact = this.case.current.contact;
    const building = this.case.current.building;
    const employee = yield this.args.model.employee;
    const origin = yield this.args.model.origin;

    const intervention = this.store.createRecord('intervention', {
      date: new Date(),
      customer,
      contact,
      building,
      employee,
      origin
    });

    yield intervention.save();
    this.router.transitionTo('main.case.intervention.edit', customer, intervention.id);
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
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
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

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, keepLatestTask } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { warn } from '@ember/debug';
import updateContactAndBuildingRequest from '../../utils/api/update-contact-and-building';

export default class InterventionPanelComponent extends Component {
  @service case
  @service documentGeneration
  @service session
  @service store
  @service router

  @tracked showUnsavedChangesDialog = false

  get isDisabledEdit() {
    return this.hasInvoice || this.args.model.isCancelled;
  }

  get isEnabledDelete() {
    return !this.isDisabledEdit;
  }

  get hasInvoice() {
    return this.case.current && this.case.current.invoice != null;
  }

  get hasFollowUpRequest() {
    return this.args.model.followUpRequest && this.args.model.followUpRequest.get('id');
  }

  get hasUnsavedChanges() {
    return this.args.model.isNew || this.args.model.validations.isInvalid || this.args.model.isError
        || (this.save.last && this.save.last.isError);
  }

  @task
  *rollbackTree() {
    this.args.model.rollbackAttributes();

    const rollbackPromises = [];
    rollbackPromises.push(this.args.model.belongsTo('wayOfEntry').reload());
    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSuccess: true });
  }

  @task
  *remove() {
    const customer = this.case.current.customer;
    const planningEvent = yield this.args.model.planningEvent;
    try {
      if (planningEvent.isPlanned) {
        planningEvent.date = null;
        yield planningEvent.save();
      }
      yield this.args.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying intervention ${this.args.model.id}`, { id: 'destroy-failure' });
      // TODO rollback to detail view?
    } finally {
      if (customer)
        this.router.transitionTo('main.customers.edit', customer);
      else
        this.router.transitionTo('main.interventions.index');
    }
  }

  @keepLatestTask
  *save(_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

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

  @task
  *createFollowUpRequest() {
    const customer = this.case.current.customer;
    const contact = this.case.current.contact;
    const building = this.case.current.building;
    const employee = yield this.args.model.employee;
    const firstName = employee ? employee.firstName : null;
    const request = this.store.createRecord('request', {
      requestDate: new Date(),
      requiresVisit: false,
      employee: firstName,
      origin: this.args.model,
      customer
    });
    yield request.save();

    const { access_token } = this.session.get('data.authenticated');
    const body = {
      contactId: contact && contact.id,
      buildingId: building && building.id,
      requestId: request.id
    };
    yield updateContactAndBuildingRequest(access_token, body);

    this.router.transitionTo('main.case.request.edit', customer, request.id, {
      queryParams: { editMode: true }
    });
  }

  @action
  closeEdit() {
    if (this.hasUnsavedChanges) {
      this.showUnsavedChangesDialog = true;
    } else {
      this.args.onCloseEdit();
    }
  }

  @action
  closeUnsavedChangesDialog() {
    this.showUnsavedChangesDialog = false;
  }

  @action
  async confirmCloseEdit() {
    this.closeUnsavedChangesDialog();
    await this.rollbackTree.perform();
    this.args.onCloseEdit();
  }

  @action
  generateInterventionReport() {
    return this.documentGeneration.interventionReport(this.args.model);
  }

  @action
  cancelIntervention() {
    this.args.model.cancellationDate = new Date();
    this.save.perform();
  }

  @action
  uncancelIntervention() {
    this.args.model.cancellationDate = null;
    this.save.perform();
  }

  @action
  createInvoice() {
    const customerId = this.case.current.customerId;
    this.router.transitionTo('main.case.intervention.edit.invoice', customerId, this.args.model.id);
  }

  @action
  async goToFollowUpRequest() {
    const request = await this.args.model.followUpRequest;
    this.router.transitionTo('main.requests.edit', request.id);
  }
}

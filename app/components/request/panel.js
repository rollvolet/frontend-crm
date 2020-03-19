import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, keepLatestTask } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { warn } from '@ember/debug';

export default class RequestPanelComponent extends Component {
  @service case
  @service documentGeneration
  @service store
  @service router

  @tracked showUnsavedChangesDialog

  get visitor() {
    return this.case.visitor;
  }

  get isDisabledEdit() {
    return this.case.current && this.case.current.offer != null;
  }

  get isEnabledDelete() {
    return !this.isDisabledEdit;
  }

  get isLinkedToCustomer() {
    return this.case.current && this.case.current.customer != null;
  }

  get isDisabledUnlinkCustomer() {
    return this.case.current && this.case.current.offer != null;
  }

  @task
  *remove() {
    const customer = this.case.current.customer;
    try {
      const calendarEvent = yield this.args.model.calendarEvent;
      if (calendarEvent)
        yield calendarEvent.destroyRecord();
      yield this.args.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying request ${this.args.model.id}`, { id: 'destroy-failure' });
      // TODO rollback to detail view?
    } finally {
      if (customer)
        this.router.transitionTo('main.customers.edit', customer);
      else
        this.router.transitionTo('main.requests.index');
    }
  }

  @task
  *rollbackTree() {
    this.args.model.rollbackAttributes();
    const calendarEvent = yield this.args.model.calendarEvent;
    if (calendarEvent)
      calendarEvent.rollbackAttributes();

    const rollbackPromises = [];
    rollbackPromises.push(this.args.model.belongsTo('wayOfEntry').reload());
    // reload of calendarEvent not necessary. We already rollbacked the attributes.
    // rollbackPromises.push(this.model.belongsTo('calendarEvent').reload());
    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSuccess: true });
  }

  @keepLatestTask
  *save(_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.args.model.validate();
    if (validations.isValid) {
      if (this.args.model.changedAttributes()['comment']) {
        yield this.args.model.save();
        // reload after save so calendar event has been updated
        this.args.model.belongsTo('calendarEvent').reload();
      } else {
        yield this.args.model.save();
      }
    }
  }

  @task
  *isValidForClosure() {
    if (this.args.model.isNew || this.args.model.validations.isInvalid || this.args.model.isError) {
      return false;
    } else if (this.save.last && this.save.last.isError) {
      return false;
    } else {
      const calendarEvent = yield this.args.model.calendarEvent;
      if (calendarEvent && !calendarEvent.isMasteredByAccess) {
        if (calendarEvent.isNew || calendarEvent.validations.isInvalid || calendarEvent.isError) {
          return false;
        }
      }
    }
    return true;
  }

  @task
  *unlinkCustomer() {
    const calendarEvent = yield this.args.model.calendarEvent;
    if (calendarEvent) {
      this.args.model.requiresVisit = false;
      yield calendarEvent.destroyRecord();
    }
    yield this.case.unlinkCustomer.perform();
    this.router.transitionTo('main.requests.edit', this.args.model.id);
  }

  @action
  openEdit() {
    this.args.onOpenEdit();
  }

  @action
  async closeEdit() {
    const isValidForClosure = await this.isValidForClosure.perform();
    if (isValidForClosure) {
      this.args.onCloseEdit();
    } else {
      this.showUnsavedChangesDialog = true;
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
  generateVisitReport() {
    return this.documentGeneration.visitReport(this.args.model);
  }

  @action
  linkCustomer() {
    this.router.transitionTo('main.requests.edit.customer', this.args.model);
  }

  @action
  async goToOrigin() {
    const intervention = await this.args.model.origin;
    this.router.transitionTo('main.interventions.edit', intervention.id);
  }
}

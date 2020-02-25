import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, keepLatestTask } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { warn } from '@ember/debug';

export default class InterventionPanelComponent extends Component {
  @service case
  @service documentGeneration
  @service store
  @service router

  @tracked showUnsavedChangesDialog = false

  get isDisabledEdit() {
    return this.case.current.invoice != null;
  }

  get isEnabledDelete() {
    return !this.isDisabledEdit;
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
    try {
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
    if (validations.isValid) {
      yield this.args.model.save();
    }
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
}

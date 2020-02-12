import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask, task } from 'ember-concurrency-decorators';
import sum from '../../utils/math/sum';

export default class DepositCollectionPanelComponent extends Component {
  @service case
  @service store

  @tracked selected
  @tracked deposits = []
  @tracked showUnsavedChangesDialog = false

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.deposits = yield this.args.model.deposits;
  }

  get customer() {
    return this.case.current && this.case.current.customer;
  }

  get invoice() {
    return this.case.current && this.case.current.invoice;
  }

  get isDisabledEdit() {
    return this.args.model.isMasteredByAccess || this.invoice;
  }

  get totalAmount() {
    return sum(this.deposits.mapBy('arithmeticAmount'));
  }

  get editMode() {
    return this.selected;
  }

  @task
  *createNew() {
    const deposit = this.store.createRecord('deposit', {
      customer: this.customer,
      order: this.args.model,
      paymentDate: new Date()
    });
    const { validations } = yield deposit.validate();
    if (validations.isValid)
      yield deposit.save();

    this.selected = deposit;
    this.deposits.pushObject(deposit);
  }

  @task
  *remove(deposit) {
    this.deposits.removeObject(deposit);
    yield deposit.destroyRecord();
  }

  @task
  *rollbackTree() {
    this.selected.rollbackAttributes();
    yield this.save.perform(null, { forceSucces: true });
  }

  @keepLatestTask
  *save(_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.selected.validate();
    if (validations.isValid) {
      yield this.selected.save();
    }
  }

  @action
  openEdit(deposit) {
    if (this.selected && this.selected.isNew)
      this.selected.destroyRecord();
    this.selected = deposit;
  }

  @action
  closeEdit() {
    if (this.selected.isNew || this.selected.validations.isInvalid || this.selected.isError
        || (this.save.last && this.save.last.isError)) {
      this.showUnsavedChangesDialog = true;
    } else {
      this.selected = null;
    }
  }

  @action
  closeUnsavedChangesDialog() {
    this.showUnsavedChangesDialog = false;
  }

  @action
  async confirmCloseEdit() {
    this.showUnsavedChangesDialog = false;
    await this.rollbackTree.perform();
    this.selected = null;
  }
}

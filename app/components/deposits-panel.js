import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { raw, sum, isEmpty, not, mapBy } from 'ember-awesome-macros';

@classic
export default class DepositsPanel extends Component {
  model = null;
  selected = null;
  depositRequired = false;
  onCreateNewDeposit = null;
  showUnsavedChangesDialog = false;
  isDisabledEdit = false;   // passed as argument

  @sum(mapBy('model', raw('amount')))
  totalAmount;

  @not(isEmpty('model'))
  hasDeposits;

  @task(function * () {
    this.selected.rollbackAttributes();
    yield this.save.perform(null, { forceSucces: true });
  })
  rollbackTree;

  @(task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.selected.validate();
    if (validations.isValid) {
      yield this.selected.save();
    }
  }).keepLatest())
  save;

  @action
  async createNew() {
    const deposit = await this.onCreate();
    this.set('selected', deposit);
  }

  @action
  openEdit(deposit) {
    if (this.selected && this.selected.isNew)
      this.selected.destroyRecord();
    this.set('selected', deposit);
  }

  @action
  closeEdit() {
    if (this.selected.isNew || this.selected.validations.isInvalid || this.selected.isError
        || (this.save.last && this.save.last.isError)) {
      this.set('showUnsavedChangesDialog', true);
    } else {
      this.set('selected', null);
    }
  }

  @action
  async confirmCloseEdit() {
    await this.rollbackTree.perform();
    this.set('selected', null);
  }

  @action
  async deleteDeposit(deposit) {
    this.model.removeObject(deposit);
    deposit.destroyRecord();
  }
}

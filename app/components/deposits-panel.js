import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { mapBy } from 'ember-awesome-macros/array';
import { sum, isEmpty, not } from 'ember-awesome-macros';
import raw from 'ember-macro-helpers/raw';

export default Component.extend({
  model: null,
  selected: null,
  depositRequired: false,
  onCreateNewDeposit: null,
  showUnsavedChangesDialog: false,
  isDisabledEdit: false,

  totalAmount: sum(mapBy('model', raw('amount'))),
  hasDeposits: not(isEmpty('model')),

  rollbackTree: task(function * () {
    this.selected.rollbackAttributes();
    yield this.save.perform(null, { forceSucces: true });
  }),
  save: task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.selected.validate();
    if (validations.isValid) {
      yield this.selected.save();
    }
  }).keepLatest(),

  actions: {
    async createNew() {
      const deposit = await this.onCreate();
      this.set('selected', deposit);
    },
    openEdit(deposit) {
      if (this.selected && this.selected.isNew)
        this.selected.destroyRecord();
      this.set('selected', deposit);
    },
    closeEdit() {
      if (this.selected.isNew || this.selected.validations.isInvalid || this.selected.isError
          || (this.save.last && this.save.last.isError)) {
        this.set('showUnsavedChangesDialog', true);
      } else {
        this.set('selected', null);
      }
    },
    async confirmCloseEdit() {
      await this.rollbackTree.perform();
      this.set('selected', null);
    },
    async deleteDeposit(deposit) {
      this.model.removeObject(deposit);
      deposit.destroyRecord();
    }
  }
});

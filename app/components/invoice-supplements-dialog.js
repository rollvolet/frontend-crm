import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  store: service(),

  tagName: '',
  show: false,
  model: null,
  showUnsavedChangesWarning: false,

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

  _closeEditSelected() {
    if (this.selected.isNew || this.selected.validations.isInvalid || this.selected.isError
        || (this.save.last && this.save.last.isError)) {
      this.set('showUnsavedChangesWarning', true);
    }
    else {
      this.set('selected', null);
    }
  },

  actions: {
    createNew() {
      const supplement = this.store.createRecord('invoice-supplement', {
        invoice: this.model
      });
      this.set('selected', supplement);
      this.save.perform();
    },
    close() {
      if (this.selected)
        this._closeEditSelected();

      if (!this.showUnsavedChangesWarning)
        this.set('show', false);
    },
    openEdit(supplement) {
      if (this.selected && this.selected.isNew)
        this.selected.destroyRecord();
      this.set('selected', supplement);
    },
    closeEdit() {
      this._closeEditSelected();
    },
    cancelCloseEdit() {
      this.set('showUnsavedChangesWarning', false);
    },
    async confirmCloseEdit() {
      await this.rollbackTree.perform();
      this.set('showUnsavedChangesWarning', false);
      this.set('selected', null);
    },
    async deleteSupplement(supplement) {
      const supplements = await this.model.supplements;
      supplements.removeObject(supplement);
      supplement.destroyRecord();
    }

  }
});

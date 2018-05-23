import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend({
  validation: service(),

  model: null,
  editMode: false,
  onOpenEdit: null,
  onCloseEdit: null,

  isValid() {
    return this.validation.required(this.model.get('requestDate'), 'Datum');
  },

  rollbackTree: task( function * () {
    this.model.rollbackAttributes();
    const rollbackPromises = [];
    rollbackPromises.push(this.model.belongsTo('wayOfEntry').reload());
    // TODO add contact/building ?
    yield all(rollbackPromises);
    yield this.save.perform(true);
  }),
  save: task(function * (forceSuccess = false) {
    if (forceSuccess) return;

    if (!this.isValid())
      throw new Error(`Invalid request`);
    yield this.model.save();
  }).keepLatest(),

  actions: {
    openEdit() {
      this.onOpenEdit();
    },
    closeEdit() {
      if (this.model.isNew || this.model.isError || (this.save.last && this.save.last.isError)) {
        this.set('showUnsavedChangesDialog', true);
      } else {
        this.onCloseEdit();
      }
    },
    confirmCloseEdit() {
      this.rollbackTree.perform();
      this.onCloseEdit();
    }
  }

});

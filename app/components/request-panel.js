import { warn } from '@ember/debug';
import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend({
  validation: service(),

  model: null,
  editMode: false,
  onOpenEdit: null,
  onCloseEdit: null,
  onRemove: null,

  isValid() {
    return this.validation.required(this.model.get('requestDate'), 'Datum');
  },

  remove: task(function * () {
    const customer = yield this.model.customer;
    try {
      yield this.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying request ${this.model.id}`, { id: 'destroy-failure' });
    } finally {
      this.onRemove(customer);
    }
  }),
  rollbackTree: task( function * () {
    this.model.rollbackAttributes();
    const rollbackPromises = [];
    rollbackPromises.push(this.model.belongsTo('wayOfEntry').reload());
    rollbackPromises.push(this.model.belongsTo('contact').reload());
    rollbackPromises.push(this.model.belongsTo('building').reload());
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

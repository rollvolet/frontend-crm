import Controller from '@ember/controller';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Controller.extend({
  validation: service(),

  queryParams: ['editMode'],
  editMode: false,

  isValid() {
    return this.validation.required(this.model.get('requestDate'), 'Datum');
  },

  rollbackTree: task( function * () {
    this.model.rollbackAttributes();
    const rollbackPromises = [];
    rollbackPromises.push(this.model.belongsTo('wayOfEntry').reload());
    rollbackPromises.push(this.model.belongsTo('contact').reload());
    rollbackPromises.push(this.model.belongsTo('building').reload());
    yield all(rollbackPromises);
  }),
  save: task(function * () {
    if (!this.isValid())
      throw new Error(`Invalid request`);
    yield this.model.save();
  }).keepLatest(),

  actions: {
    openEdit() {
        this.set('editMode', true);
    },
    closeEdit() {
      if (this.model.isNew || this.model.isError || (this.save.last && this.save.last.isError)) {
        this.set('showUnsavedChangesDialog', true);
      } else {
        this.set('editMode', false);
      }
    },
    confirmCloseEdit() {
      this.rollbackTree.perform();
      this.set('editMode', false);
    }
  }
});

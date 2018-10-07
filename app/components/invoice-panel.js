import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { notEmpty } from '@ember/object/computed';

export default Component.extend({
  case: service(),
  router: service(),

  model: null,
  editMode: false,
  onOpenEdit: null,
  onCloseEdit: null,
  showUnsavedChangesDialog: false,

  isDisabledEdit: notEmpty('model.bookingDate'),

  remove: task(function * () {
    const order = yield this.model.order;
    try {
      yield this.model.destroyRecord();

      // update case-tabs
      this.case.set('current.invoiceId', null);

      this.router.transitionTo('main.case.order.edit', order);
    } catch (e) {
      warn(`Something went wrong while destroying invoice ${this.model.id}`, { id: 'destroy-failure' });
    }
  }),
  rollbackTree: task( function * () {
    this.model.rollbackAttributes();
    // TODO rollback relations that might have changed?
    yield this.save.perform(null, { forceSucces: true });
  }),
  save: task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.model.validate();
    if (validations.isValid)
      yield this.model.save();
  }).keepLatest(),

  actions: {
    openEdit() {
      this.onOpenEdit();
    },
    closeEdit() {
      if (this.model.isNew || this.model.validations.isInvalid || this.model.isError
          || (this.save.last && this.save.last.isError)
          || this.hasFailedVisit) {
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

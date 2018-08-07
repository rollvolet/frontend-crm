import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { notEmpty } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { EKMixin, keyUp } from 'ember-keyboard';

export default Component.extend(EKMixin, {
  case: service(),
  router: service(),
  store: service(),

  model: null,
  editMode: false,
  onOpenEdit: null,
  onCloseEdit: null,
  onContactChange: null,
  onBuildingChange: null,
  showUnsavedChangesDialog: false,

  isDisabledEdit: notEmpty('model.invoice.id'),

  init() {
    this._super(...arguments);
    this.set('keyboardActivated', true); // required for ember-keyboard
  },

  remove: task(function * () {
    const offer = yield this.model.offer;
    offer.set('order', null);
    try {
      yield offer.save();
      this.case.set('current.orderId', null);
      yield this.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying order ${this.model.id}`, { id: 'destroy-failure' });
      // TODO rollback to detail view?
    } finally {
      this.router.transitionTo('main.case.offer.edit', offer);
    }
  }),
  rollbackTree: task(function * () {
    this.model.rollbackAttributes();
    const rollbackPromises = [];
    rollbackPromises.push(this.model.belongsTo('vatRate').reload());
    rollbackPromises.push(this.model.belongsTo('contact').reload());
    rollbackPromises.push(this.model.belongsTo('building').reload());
    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSucces: true });
  }),
  save: task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.model.validate();
    if (validations.isValid)
      yield this.model.save();
  }).keepLatest(),

  openEditByShortcut: on(keyUp('ctrl+alt+KeyU'), function() {
    this.onOpenEdit();
  }),

  actions: {
    async createNewDeposit() {
      const customer = await this.model.customer;
      const deposit = this.store.createRecord('deposit', {
        customer: customer,
//        order: this.model,
        paymentDate: new Date(),
        amount: 0
      });
      this.model.deposits.pushObject(deposit);
      return deposit;
    },
    openEdit() {
      this.onOpenEdit();
    },
    closeEdit() {
      if (this.model.isNew || this.model.validations.isInvalid || this.model.isError
          || (this.save.last && this.save.last.isError)) {
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

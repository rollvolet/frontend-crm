import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { computed } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { EKMixin, keyUp } from 'ember-keyboard';

export default Component.extend(EKMixin, {
  documentGeneration: service(),
  router: service(),

  model: null,
  editMode: false,
  onOpenEdit: null,
  onCloseEdit: null,
  showUnsavedChangesDialog: false,

  isDisabledEdit: notEmpty('model.offer.id'),
  isLinkedToCustomer: notEmpty('model.customer.id'),

  hasFailedVisit: computed('model.visit', function() {
    return this.model.get('visit') &&
      (this.model.get('visit.isNew')
       || this.model.get('visit.validations.isInvalid')
       || this.model.get('visit.isError'));
  }),

  init() {
    this._super(...arguments);
    this.set('keyboardActivated', true); // required for ember-keyboard
  },

  remove: task(function * () {
    const customer = yield this.model.customer;
    try {
      const visit = yield this.model.visit;
      if (visit)
        yield visit.destroyRecord();
      yield this.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying request ${this.model.id}`, { id: 'destroy-failure' });
      // TODO rollback to detail view?
    } finally {
      this.router.transitionTo('main.customers.edit', customer);
    }
  }),
  rollbackTree: task( function * () {
    this.model.rollbackAttributes();
    const rollbackPromises = [];
    rollbackPromises.push(this.model.belongsTo('wayOfEntry').reload());
    rollbackPromises.push(this.model.belongsTo('contact').reload());
    rollbackPromises.push(this.model.belongsTo('building').reload());
    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSucces: true });
  }),
  save: task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.model.validate();
    if (validations.isValid) {
      yield this.model.save();
    }
  }).keepLatest(),
  unlinkCustomer: task(function * () {
    this.model.set('customer', null);
    this.model.set('contact', null);
    this.model.set('building', null);
    yield this.save.perform();
    this.router.transitionTo('main.requests.edit', this.model);
  }),

  // eslint-disable-next-line ember/no-on-calls-in-components
  openEditByShortcut: on(keyUp('ctrl+alt+KeyU'), function() {
    this.onOpenEdit();
  }),

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
    },
    generateVisitReport() {
      return this.documentGeneration.visitReport(this.model);
    },
    linkCustomer() {
      this.router.transitionTo('main.requests.edit.customer', this.model);
    }
  }
});

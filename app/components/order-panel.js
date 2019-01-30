import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { debug, warn } from '@ember/debug';
import { computed } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { EKMixin, keyUp } from 'ember-keyboard';
import { or, raw } from 'ember-awesome-macros';
import { filterBy } from 'ember-awesome-macros/array';
import DS from 'ember-data';

export default Component.extend(EKMixin, {
  case: service(),
  router: service(),
  store: service(),

  model: null,
  editMode: false,
  onOpenEdit: null,
  onCloseEdit: null,
  showUnsavedChangesDialog: false,

  orderedOfferlines: filterBy('model.offer.offerlines.@each.isOrdered', raw('isOrdered')),
  hasInvoice: notEmpty('model.invoice.id'),
  isDisabledEdit: or('model.isMasteredByAccess', 'hasInvoice'),
  visitorPromise: computed('model.offer.request.visitor', function() {
    return DS.PromiseObject.create({
      promise: this.model.offer.then((offer) => {
        return offer && offer.request.then((request) => {
          return request && this.store.peekAll('employee').find(e => e.firstName == request.visitor);
        });
      })
    });
  }),

  init() {
    this._super(...arguments);
    this.set('keyboardActivated', true); // required for ember-keyboard
  },

  remove: task(function * () {
    const offer = yield this.model.offer;
    try {
      // unorder offerlines
      this.orderedOfferlines.forEach(o => o.set('isOrdered', false));
      yield all(offer.offerlines.map(o => o.save()));

      // destroy deposits
      const deposits = yield this.model.deposits;
      yield all(deposits.map(d => d.destroyRecord()));

      // unlink offer
      offer.set('order', null);
      yield offer.save();

      // update case-tabs
      this.case.updateRecord('order', null);

      // delete order
      yield this.model.destroyRecord();
      // TODO: Fix this hack when Ember Data allows creation of already deleted ID
      // See https://github.com/emberjs/data/issues/5006
      // this.store._removeFromIdMap(this.model._internalModel);

      this.router.transitionTo('main.case.offer.edit', offer);
    } catch (e) {
      warn(`Something went wrong while destroying order ${this.model.id}`, { id: 'destroy-failure' });

      offer.set('order', this.model);
      yield offer.save();
      this.case.set('current.orderId', this.model.id);
      yield this.model.rollbackAttributes(); // undo delete-state
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
    if (validations.isValid) {
      if (this.model.changedAttributes().comment) {
        const invoice = yield this.model.invoice;
        if (invoice) {
          debug('Syncing comment of invoice with updated comment of order');
          invoice.set('comment', this.model.comment);
          yield invoice.save();
        }
      }
      yield this.model.save();
    }
  }).keepLatest(),

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

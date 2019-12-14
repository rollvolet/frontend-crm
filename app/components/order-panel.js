import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { debug, warn } from '@ember/debug';
import { on } from '@ember/object/evented';
import { EKMixin, keyUp } from 'ember-keyboard';
import { computed } from '@ember/object';
import { and, or, bool, not, notEmpty, raw, filterBy, mapBy, sum } from 'ember-awesome-macros';

export default Component.extend(EKMixin, {
  case: service(),
  documentGeneration: service(),
  router: service(),
  store: service(),

  model: null,
  editMode: false,
  onOpenEdit: null,
  onCloseEdit: null,
  showUnsavedChangesDialog: false,

  orderedOfferlines: filterBy('model.offer.offerlines.@each.isOrdered', raw('isOrdered')),
  hasInvoice: notEmpty('model.invoice.id'),
  hasDepositInvoice: bool('model.depositInvoices.length'),
  hasDeposit: bool('model.deposits.length'),
  isDisabledEdit: or('model.isMasteredByAccess', 'hasInvoice'),
  isEnabledDelete: and(not('isDisabledEdit'), not('hasDepositInvoice'), not('hasDeposit')),
  arithmeticAmounts: mapBy('orderedOfferlines', raw('arithmeticAmount')),
  arithmeticVats: mapBy('orderedOfferlines', raw('arithmeticVat')),
  totalAmount: sum('arithmeticAmounts'),
  totalVat: computed('arithmeticVats', function() {
    return Promise.all(this.arithmeticVats).then(values => {
      return values.reduce((a, b) => a + b, 0);
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
    yield this.save.perform(null, { forceSuccess: true });
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

    // Save change of visitor
    const offer = yield this.model.offer;
    const request = yield offer.request;
    yield request.save();
  }).keepLatest(),
  generateOrderDocument: task(function * () {
    try {
      yield this.documentGeneration.orderDocument(this.model);
    } catch(e) {
      warn(`Something went wrong while generating the order document`, { id: 'document-generation-failure' });
    }
  }),
  generateDeliveryNote: task(function * () {
    try {
      yield this.documentGeneration.deliveryNote(this.model);
    } catch(e) {
      warn(`Something went wrong while generating the delivery note`, { id: 'document-generation-failure' });
    }
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
          || (this.save.last && this.save.last.isError)) {
        this.set('showUnsavedChangesDialog', true);
      } else {
        this.onCloseEdit();
      }
    },
    confirmCloseEdit() {
      this.rollbackTree.perform();
      this.onCloseEdit();
    },
    downloadOrderDocument() {
      this.documentGeneration.downloadOrderDocument(this.model);
    },
    downloadDeliveryNote() {
      this.documentGeneration.downloadDeliveryNote(this.model);
    }
  }
});

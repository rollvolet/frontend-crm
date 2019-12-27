import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { debug, warn } from '@ember/debug';
import { length } from 'ember-awesome-macros/array';
import { not, notEmpty, or, gt, raw, uniqBy, mapBy } from 'ember-awesome-macros';
import { on } from '@ember/object/evented';
import { EKMixin, keyUp } from 'ember-keyboard';
import PellOptions from '../mixins/pell-options';
import { sort } from '@ember/object/computed';

export default Component.extend(EKMixin, PellOptions, {
  case: service(),
  documentGeneration: service(),
  router: service(),
  store: service(),

  model: null,
  editMode: false,
  onOpenEdit: null,
  onCloseEdit: null,
  showUnsavedChangesDialog: false,

  offerlineSorting: Object.freeze(['sequenceNumber']),
  sortedOfferlines: sort('model.offerlines', 'offerlineSorting'),
  hasOrder: notEmpty('model.order.id'),
  isDisabledEdit: or('model.isMasteredByAccess', 'hasOrder'),
  isEnabledDelete: not('isDisabledEdit'),
  vatRates: mapBy('model.offerlines', raw('vatRate')),
  hasMixedVatRates: gt(length(uniqBy('vatRates', raw('code'))), raw(1)),
  hasUnsavedChanges: async function() {
    const offerlines = await this.model.offerlines;
    const offerlineWithUnsavedChanges = offerlines.find(o => o.isNew || o.validations.isInvalid || o.isError);
    return offerlineWithUnsavedChanges != null
      || this.model.isNew || this.model.validations.isInvalid || this.model.isError
      || (this.save.last && this.save.last.isError);
  },

  init() {
    this._super(...arguments);
    this.set('keyboardActivated', true); // required for ember-keyboard
  },

  remove: task(function * () {
    const request = yield this.model.request;
    try {
      this.case.updateRecord('offer', null);
      yield all(this.model.offerlines.map(t => t.destroyRecord()));
      yield this.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying offer ${this.model.id}`, { id: 'destroy-failure' });
      // TODO rollback to detail view?
    } finally {
      this.router.transitionTo('main.case.request.edit', request);
    }
  }),
  rollbackTree: task(function * () {
    const rollbackPromises = [];

    const offerlines = yield this.model.offerlines;
    offerlines.forEach(offerline => {
      offerline.rollbackAttributes();
      rollbackPromises.push(offerline.belongsTo('vatRate').reload());
    });

    this.model.rollbackAttributes();
    rollbackPromises.push(this.model.belongsTo('vatRate').reload());
    rollbackPromises.push(this.model.belongsTo('contact').reload());
    rollbackPromises.push(this.model.belongsTo('building').reload());

    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSuccess: true });
  }),
  save: task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.model.validate();
    let requiresOrderReload = false;
    if (validations.isValid) {
      const changedAttributes = this.model.changedAttributes();
      const fieldsToSyncWithInvoice = ['reference', 'comment'];
      for (let field of fieldsToSyncWithInvoice) {
        if (changedAttributes[field]) {
          const order = yield this.model.order;
          if (order) {
            const invoice = yield order.invoice;
            if (invoice) {
              debug(`Syncing ${field} of invoice with updated ${field} of offer`);
              invoice.set(field, this.model.get(field));
              yield invoice.save();
            }
          }
          requiresOrderReload = true;
        }
      }
      yield this.model.save();

      if (requiresOrderReload)
        yield this.model.belongsTo('order').reload();
    }

    // Save change of visitor
    const request = yield this.model.request;
    yield request.save();
  }),
  generateOfferDocument: task(function * () {
    const oldOfferDate = this.model.offerDate;
    try {
      this.model.set('offerDate', new Date());
      yield this.save.perform();
      yield this.documentGeneration.offerDocument(this.model);
    } catch(e) {
      warn(`Something went wrong while generating the offer document`, { id: 'document-generation-failure' });
      this.model.set('offerDate', oldOfferDate);
      yield this.save.perform();
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
    async closeEdit() {
      const hasUnsavedChanges = await this.hasUnsavedChanges();
      if (hasUnsavedChanges) {
        this.set('showUnsavedChangesDialog', true);
      } else {
        this.onCloseEdit();
      }
    },
    confirmCloseEdit() {
      this.rollbackTree.perform();
      this.onCloseEdit();
    },
    async addOfferline() {
      const offerlines = await this.model.offerlines;
      const number = offerlines.length ? Math.max(...offerlines.map(o => o.sequenceNumber)) : 0;
      const vatRate = await this.model.vatRate;
      const offerline = this.store.createRecord('offerline', {
        sequenceNumber: number + 1,
        isOrdered: false,
        offer: this.model,
        vatRate
      });
      if (this.model.isMasteredByAccess) {
        this.model.set('amount', 0); // make sure offer is no longer mastered by Access
        this.model.save();
      }
      const { validations } = await offerline.validate();
      if (validations.isValid)
        offerline.save();

      this.onOpenEdit();
    },
    deleteOfferline(offerline) {
      this.model.offerlines.removeObject(offerline);
      offerline.destroyRecord();
    },
    downloadOfferDocument() {
      this.documentGeneration.downloadOfferDocument(this.model);
    }
  }
});

import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { debug, warn } from '@ember/debug';
import { not, notEmpty, mapBy } from '@ember/object/computed';
import { uniqBy, length } from 'ember-awesome-macros/array';
import { or, gt, raw } from 'ember-awesome-macros';
import { on } from '@ember/object/evented';
import { EKMixin, keyUp } from 'ember-keyboard';
import PellOptions from '../mixins/pell-options';

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
  showOfferDocumentNotFoundDialog: false,

  hasOrder: notEmpty('model.order.id'),
  isDisabledEdit: or('model.isMasteredByAccess', 'hasOrder'),
  isEnabledDelete: not('isDisabledEdit'),
  vatRates: mapBy('model.offerlines', 'vatRate'),
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
    rollbackPromises.push(this.model.belongsTo('submissionType').reload());
    rollbackPromises.push(this.model.belongsTo('contact').reload());
    rollbackPromises.push(this.model.belongsTo('building').reload());

    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSucces: true });
  }),
  save: task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.model.validate();
    if (validations.isValid) {
      if (this.model.changedAttributes().reference) {
        const order = yield this.model.order;
        if (order) {
          const invoice = yield order.invoice;
          if (invoice) {
            debug('Syncing reference of invoice with updated reference of offer');
            invoice.set('reference', this.model.reference);
            yield invoice.save();
          }
        }
      }
      yield this.model.save();
    }
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
      const number = this.model.get('offerlines.length');
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
      offerline.save();
      this.onOpenEdit();
    },
    deleteOfferline(offerline) {
      this.model.offerlines.removeObject(offerline);
      offerline.destroyRecord();
    },
    async downloadOfferDocument() {
      const document = await this.documentGeneration.downloadOfferDocument(this.model);

      if (!document)
        this.set('showOfferDocumentNotFoundDialog', true);
    },
    confirmAlert() {
      this.set('showOfferDocumentNotFoundDialog', false);
    }
  }
});

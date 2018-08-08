import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { notEmpty } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { EKMixin, keyUp } from 'ember-keyboard';

export default Component.extend(EKMixin, {
  case: service(),
  documentGeneration: service(),
  router: service(),
  store: service(),

  model: null,
  editMode: false,
  onOpenEdit: null,
  onCloseEdit: null,
  onContactChange: null,
  onBuildingChange: null,
  showUnsavedChangesDialog: false,

  isDisabledEdit: notEmpty('model.order.id'),
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
    request.set('offer', null);
    try {
      yield request.save();
      this.case.set('current.offerId', null);
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
    if (validations.isValid)
      yield this.model.save();
  }).keepLatest(),

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
        offer: this.model,
        vatRate
      });
      offerline.save();
      this.onOpenEdit();
    },
    deleteOfferline(offerline) {
      this.model.offerlines.removeObject(offerline);
      offerline.destroyRecord();
    },
    generateOfferDocument() {
      return this.documentGeneration.offerDocument(this.model);
    }
  }
});

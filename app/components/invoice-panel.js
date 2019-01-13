import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { debug, warn } from '@ember/debug';
import { notEmpty } from '@ember/object/computed';
import { or } from 'ember-awesome-macros';

export default Component.extend({
  case: service(),
  documentGeneration: service(),
  router: service(),

  model: null,
  editMode: false,
  onBuildingChange: null,
  onContactChange: null,
  onOpenEdit: null,
  onCloseEdit: null,
  showInvoiceDocumentDialog: false,
  showInvoiceDocumentNotFoundDialog: false,
  showUnsavedChangesDialog: false,

  isBooked: notEmpty('model.bookingDate'),
  isDisabledEdit: or('model.isMasteredByAccess', 'isBooked'),

  remove: task(function * () {
    const customer = yield this.model.customer;
    const order = yield this.model.order;

    try {
      yield this.model.destroyRecord();

      // update case-tabs
      this.case.set('current.invoiceId', null);

      if (order)
        this.router.transitionTo('main.case.order.edit', order);
      else
        this.router.transitionTo('main.customers.edit', customer);
    } catch (e) {
      warn(`Something went wrong while destroying invoice ${this.model.id}`, { id: 'destroy-failure' });
    }
  }),
  rollbackTree: task( function * () {
    const rollbackPromises = [];

    this.model.rollbackAttributes();

    rollbackPromises.push(this.model.belongsTo('vatRate').reload());

    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSucces: true });
  }),
  save: task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.model.validate();
    if (validations.isValid) {
      if (this.model.changedAttributes().comment) {
        const order = yield this.model.order;
        if (order) {
          debug('Syncing comment of order with updated comment of invoice');
          order.set('comment', this.model.comment);
          yield order.save();
        }
      }

      if (this.model.changedAttributes().reference) {
        const order = yield this.model.order;
        if (order) {
          const offer = yield order.offer;
          if (offer) {
            debug('Syncing reference of offer with updated reference of invoice');
            offer.set('reference', this.model.reference);
            yield offer.save();
          }
        }
      }

      yield this.model.save();
    }
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
    },
    async downloadInvoiceDocument() {
      const document = await this.documentGeneration.downloadInvoiceDocument(this.model);

      if (!document)
        this.set('showInvoiceDocumentNotFoundDialog', true);
    },
    openInvoiceDocumentDialog() {
      this.set('showInvoiceDocumentDialog', true);
    }
  }
});

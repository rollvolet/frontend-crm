import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { debug, warn } from '@ember/debug';
import { or, not } from 'ember-awesome-macros';

export default Component.extend({
  case: service(),
  documentGeneration: service(),
  router: service(),

  model: null,
  editMode: false,
  onOpenEdit: null,
  onCloseEdit: null,
  showUnsavedChangesDialog: false,
  showMissingCertificateDialog: false,

  isDisabledEdit: or('model.isMasteredByAccess', 'model.isBooked'),
  isEnabledDelete: not('isDisabledEdit'),

  remove: task(function * () {
    const customer = yield this.model.customer;
    const order = yield this.model.order;

    try {
      this.case.updateRecord('invoice', null);

      const supplements = yield this.model.supplements;
      yield all(supplements.map(t => t.destroyRecord()));
      yield this.model.destroyRecord();

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
    yield this.save.perform(null, { forceSuccess: true });
  }),
  save: task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.model.validate();
    if (validations.isValid) {
      const changedAttributes = this.model.changedAttributes();
      const fieldsToSyncWithOrder = ['reference', 'comment'];
      for (let field of fieldsToSyncWithOrder) {
        if (changedAttributes[field]) {
          const order = yield this.model.order;
          if (order) {
            debug(`Syncing ${field} of offer/order with updated ${field} of invoice`);
            order.set(field, this.model.get(field));
            yield order.save();
            yield order.belongsTo('offer').reload();
          }
        }
      }

      yield this.model.save();
    }
  }).keepLatest(),

  generateInvoiceDocument: task(function * () {
    if (!this.showMissingCertificateDialog && this.model.certificateRequired && !this.model.certificateReceived) {
      this.set('showMissingCertificateDialog', true);
    } else {
      this.set('showMissingCertificateDialog', false);
      const oldInvoiceDate = this.model.invoiceDate;
      try {
        this.model.set('invoiceDate', new Date());
        yield this.save.perform();
        yield this.documentGeneration.invoiceDocument(this.model);
      } catch(e) {
        warn(`Something went wrong while generating the invoice document`, { id: 'document-generation-failure' });
        this.model.set('invoiceDate', oldInvoiceDate);
        yield this.save.perform();
      }
    }
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
    downloadInvoiceDocument() {
      this.documentGeneration.downloadInvoiceDocument(this.model);
    }
  }
});

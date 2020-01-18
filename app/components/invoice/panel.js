import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, all } from 'ember-concurrency';
import { debug, warn } from '@ember/debug';

export default class InvoicePanelComponent extends Component {
  @service case
  @service documentGeneration
  @service router

  @tracked showUnsavedChangesDialog = false;
  @tracked showMissingCertificateDialog = false;

  get isDisableEdit() {
    return this.args.model.isMasteredByAccess || this.args.model.isBooked;
  }

  get isEnabledDelete() {
    return !this.isDisableEdit;
  }

  @task(function*(vatRate) {
    const invoicelines = yield this.args.model.invoicelines;
    yield all(invoicelines.map(async (invoiceline) => {
      invoiceline.vatRate = vatRate;
      invoiceline.save();
    }));
  })
  updateInvoicelinesVatRate

  @task(function*() {
    const customer = yield this.args.model.customer;
    const order = yield this.args.model.order;

    try {
      this.case.updateRecord('invoice', null);

      const supplements = yield this.model.supplements;
      yield all(supplements.map(t => t.destroyRecord()));
      const invoicelines = yield this.args.model.invoicelines;
      const copiedInvoicelines = invoicelines.slice(0);
      yield all(copiedInvoicelines.map(async (invoiceline) => {
        invoiceline.invoice = null;
        invoiceline.save();
      }));
      yield this.args.model.destroyRecord();

      if (order)
        this.router.transitionTo('main.case.order.edit', order);
      else
        this.router.transitionTo('main.customers.edit', customer);
    } catch (e) {
      warn(`Something went wrong while destroying invoice ${this.args.model.id}`, { id: 'destroy-failure' });
    }
  })
  remove

  @task(function*() {
    const rollbackPromises = [];

    this.args.model.rollbackAttributes();

    rollbackPromises.push(this.args.model.belongsTo('vatRate').reload());

    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSuccess: true });
  })
  rollbackTree

  @(task(function*(_, { forceSuccess = false } = {}) {
    if (forceSuccess) return;

    const { validations } = yield this.args.model.validate();
    if (validations.isValid) {
      const changedAttributes = this.args.model.changedAttributes();
      const fieldsToSyncWithOrder = ['reference', 'comment'];
      for (let field of fieldsToSyncWithOrder) {
        if (changedAttributes[field]) {
          const order = yield this.args.model.order;
          if (order) {
            debug(`Syncing ${field} of offer/order with updated ${field} of invoice`);
            order.set(field, this.args.model.get(field));
            yield order.save();
            yield order.belongsTo('offer').reload();
          }
        }
      }

      yield this.args.model.save();
    }
  }).keepLatest())
  save

  @task(function*() {
    if (!this.showMissingCertificateDialog && this.args.model.certificateRequired && !this.args.model.certificateReceived) {
      this.showMissingCertificateDialog = true;
    } else {
      this.showMissingCertificateDialog = false;
      const oldInvoiceDate = this.args.model.invoiceDate;
      try {
        this.args.model.invoiceDate = new Date();
        yield this.save.perform();
        yield this.documentGeneration.invoiceDocument(this.args.model);
      } catch (e) {
        warn(`Something went wrong while generating the invoice document`, { id: 'document-generation-failure' });
        this.args.model.invoiceDate = oldInvoiceDate;
        yield this.save.perform();
      }
    }
  })
  generateInvoiceDocument

  @action
  closeEdit() {
    if (this.args.model.isNew || this.args.model.validations.isInvalid || this.args.model.isError
      || (this.save.last && this.save.last.isError)
      || this.hasFailedVisit) {
      this.showUnsavedChangesDialog = true;
    } else {
      this.args.onCloseEdit();
    }
  }

  @action
  closeUnsavedChangesDialog() {
    this.showUnsavedChangesDialog = false;
  }

  @action
  confirmCloseEdit() {
    this.closeUnsavedChangesDialog();
    this.rollbackTree.perform();
    this.args.onCloseEdit();
  }

  @action
  downloadInvoiceDocument() {
    this.documentGeneration.downloadInvoiceDocument(this.args.model);
  }

}

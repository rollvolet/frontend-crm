import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { debug, warn } from '@ember/debug';
import { or, not } from 'ember-awesome-macros';

@classic
export default class InvoicePanel extends Component {
  @service case

  @service documentGeneration

  @service router

  model = null;
  editMode = false;
  onOpenEdit = null;
  onCloseEdit = null;
  showUnsavedChangesDialog = false;
  showMissingCertificateDialog = false;

  @or('model.isMasteredByAccess', 'model.isBooked')
  isDisabledEdit;

  @not('isDisabledEdit')
  isEnabledDelete;

  @task(function * (vatRate) {
    const invoicelines = yield this.model.invoicelines;
    yield all(invoicelines.map(async (invoiceline) => {
      invoiceline.set('vatRate', vatRate);
      invoiceline.save();
    }));
  })
  updateInvoicelinesVatRate

  @task(function * () {
    const customer = yield this.model.customer;
    const order = yield this.model.order;

    try {
      this.case.updateRecord('invoice', null);

      const supplements = yield this.model.supplements;
      yield all(supplements.map(t => t.destroyRecord()));
      const invoicelines = yield this.model.invoicelines;
      const copiedInvoicelines = invoicelines.slice(0);
      yield all(copiedInvoicelines.map(async (invoiceline) => {
        invoiceline.invoice = null;
        await invoiceline.save();
      }));
      yield this.model.destroyRecord();

      if (order)
        this.router.transitionTo('main.case.order.edit', order);
      else
        this.router.transitionTo('main.customers.edit', customer);
    } catch (e) {
      warn(`Something went wrong while destroying invoice ${this.model.id}`, { id: 'destroy-failure' });
    }
  })
  remove;

  @task(function * () {
    const rollbackPromises = [];

    this.model.rollbackAttributes();

    rollbackPromises.push(this.model.belongsTo('vatRate').reload());

    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSuccess: true });
  })
  rollbackTree;

  @(task(function * (_, { forceSuccess = false } = {} ) {
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
  }).keepLatest())
  save;

  @task(function * () {
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
  })
  generateInvoiceDocument;

  @action
  openEdit() {
    this.onOpenEdit();
  }

  @action
  closeEdit() {
    if (this.model.isNew || this.model.validations.isInvalid || this.model.isError
        || (this.save.last && this.save.last.isError)
        || this.hasFailedVisit) {
      this.set('showUnsavedChangesDialog', true);
    } else {
      this.onCloseEdit();
    }
  }

  @action
  closeUnsavedChangesDialog() {
    this.set('showUnsavedChangesDialog', false);
  }

  @action
  confirmCloseEdit() {
    this.closeUnsavedChangesDialog();
    this.rollbackTree.perform();
    this.onCloseEdit();
  }

  @action
  downloadInvoiceDocument() {
    this.documentGeneration.downloadInvoiceDocument(this.model);
  }
}

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { keepLatestTask, task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { debug, warn } from '@ember/debug';

export default class InvoicePanelComponent extends Component {
  @service case
  @service documentGeneration
  @service router

  @tracked invoicelines = []
  @tracked showUnsavedChangesDialog = false
  @tracked showMissingCertificateDialog = false

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const model = this.args.model;
    this.vatRate = yield model.vatRate;
    this.invoicelines = yield model.load('invoicelines');
    yield all(this.invoicelines.map(line => line.sideload('order,invoice')));
  }

  get isDisableEdit() {
    return this.args.model.isMasteredByAccess || this.args.model.isBooked;
  }

  get isEnabledDelete() {
    return !this.isDisableEdit;
  }

  get order() {
    return this.case.current && this.case.current.order;
  }

  get customer() {
    return this.case.current && this.case.current.customer;
  }

  @task
  *updateInvoicelinesVatRate(vatRate) {
    yield all(this.invoicelines.map(async (invoiceline) => {
      invoiceline.vatRate = vatRate;
      await invoiceline.save();
    }));
  }

  @task
  *rollabckTree() {
    const rollbackPromises = [];

    this.invoicelines.forEach(invoiceline => {
      invoiceline.rollbackAttributes();
      rollbackPromises.push(invoiceline.belongsTo('vatRate').reload());
    });

    this.args.model.rollbackAttributes();
    rollbackPromises.push(this.args.model.belongsTo('vatRate').reload());

    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSuccess: true });
  }

  @task
  *remove() {
    try {
      const supplements = yield this.args.model.load('supplements');
      yield all(supplements.map(async (t) => await t.destroyRecord()));

      const copiedInvoicelines = this.invoicelines.slice(0);
      yield all(copiedInvoicelines.map(async (invoiceline) => {
        invoiceline.invoice = null;
        await invoiceline.save();
      }));

      yield this.args.model.destroyRecord();
      this.case.updateRecord('invoice', null);

      if (this.order)
        this.router.transitionTo('main.case.order.edit', this.order.id);
      else
        this.router.transitionTo('main.customers.edit', this.customer.id);
    } catch (e) {
      warn(`Something went wrong while destroying invoice ${this.args.model.id}`, { id: 'destroy-failure' });
      if (this.order) {
        this.order.invoice = this.args.model;
        yield this.order.save();
        yield this.args.model.rollbackAttributes(); // undo delete-state
      }
    }
  }

  @keepLatestTask
  *save(_, { forceSuccess = false } = {}) {
    if (forceSuccess) return;

    const { validations } = yield this.args.model.validate();
    let requiresOfferReload = false;
    if (validations.isValid) {
      const changedAttributes = this.args.model.changedAttributes();
      const fieldsToSyncWithOrder = ['reference', 'comment'];
      for (let field of fieldsToSyncWithOrder) {
        if (changedAttributes[field]) {
          if (this.order) {
            debug(`Syncing ${field} of offer/order with updated ${field} of invoice`);
            this.order[field] = this.args.model[field];
            yield this.order.save();
          }
          requiresOfferReload = true;
        }
      }

      yield this.args.model.save();

      if (requiresOfferReload)
        yield this.order.belongsTo('offer').reload();
    }
  }

  @task
  *generateInvoiceDocument() {
    if (!this.showMissingCertificateDialog && this.args.model.certificateRequired && !this.args.model.certificateReceived) {
      this.showMissingCertificateDialog = true;
    } else {
      this.showMissingCertificateDialog = false;
      try {
        yield this.documentGeneration.invoiceDocument(this.args.model);
      } catch (e) {
        warn(`Something went wrong while generating the invoice document`, { id: 'document-generation-failure' });
      }
    }
  }

  @action
  closeEdit() {
    if (this.args.model.isNew || this.args.model.validations.isInvalid || this.args.model.isError
      || (this.save.last && this.save.last.isError)
      || this.hasFailedVisit) {  // TODO implement hasFailedVisit
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
  async confirmCloseEdit() {
    this.showUnsavedChangesDialog = false;
    await this.rollbackTree.perform();
    this.args.onCloseEdit();
  }

  @action
  downloadInvoiceDocument() {
    this.documentGeneration.downloadInvoiceDocument(this.args.model);
  }

}

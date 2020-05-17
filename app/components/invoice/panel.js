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

  get isDisabledEdit() {
    return this.args.model.isMasteredByAccess || this.args.model.isBooked;
  }

  get isEnabledDelete() {
    return !this.isDisabledEdit;
  }

  get hasUnsavedChanges() {
    const invoicelinesWithUnsavedChanges = this.invoicelines.find(o => o.isNew || o.validations.isInvalid || o.isError);
    return invoicelinesWithUnsavedChanges != null
        || this.args.model.isNew || this.args.model.validations.isInvalid || this.args.model.isError
        || (this.save.last && this.save.last.isError);
  }

  get intervention() {
    return this.case.current && this.case.current.intervention;
  }

  get order() {
    return this.case.current && this.case.current.order;
  }

  get customer() {
    return this.case.current && this.case.current.customer;
  }

  get isIsolated() {
    return this.intervention == null && this.order == null;
  }

  @task
  *updateInvoicelinesVatRate(vatRate) {
    yield all(this.invoicelines.map(async (invoiceline) => {
      invoiceline.vatRate = vatRate;
      await invoiceline.save();
    }));
  }

  @task
  *rollbackTree() {
    const rollbackPromises = [];

    this.invoicelines.forEach(invoiceline => {
      if (!invoiceline.isNew) {
        rollbackPromises.push(invoiceline.belongsTo('vatRate').reload());
      }
      invoiceline.rollbackAttributes();
    });

    this.args.model.rollbackAttributes();
    rollbackPromises.push(this.args.model.belongsTo('vatRate').reload());

    yield all(rollbackPromises);
    yield this.save.perform(null, { forceSuccess: true });
  }

  @task
  *remove() {
    try {
      const supplements = yield this.args.model.supplements;
      yield all(supplements.map((suppl) => suppl.destroyRecord()));

      const copiedInvoicelines = this.invoicelines.slice(0);
      if (this.isIsolated) {
        yield all(copiedInvoicelines.map((invoiceline) => invoiceline.destroyRecord()));
      } else {
        yield all(copiedInvoicelines.map((invoiceline) => {
          invoiceline.invoice = null;
          invoiceline.save();
        }));
      }

      this.case.updateRecord('invoice', null);
      yield this.args.model.destroyRecord();

      if (this.order)
        this.router.transitionTo('main.case.order.edit', this.order.id);
      else if (this.intervention)
        this.router.transitionTo('main.case.intervention.edit', this.intervention.id);
      else
        this.router.transitionTo('main.customers.edit', this.customer.id);
    } catch (e) {
      warn(`Something went wrong while destroying invoice ${this.args.model.id}`, { id: 'destroy-failure' });
      yield this.args.model.rollbackAttributes(); // undo delete-state
      if (this.order) {
        this.order.invoice = this.args.model;
        yield this.order.save();
      } else if (this.intervention) {
        this.intervention.invoice = this.args.model;
        yield this.intervention.save();
      }
      this.case.updateRecord('invoice', this.args.model);
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

      if (this.order && requiresOfferReload)
        yield this.order.belongsTo('offer').reload();
    }
  }

  @task
  *generateInvoiceDocument() {
    if (!this.args.model.isCreditNote && !this.showMissingCertificateDialog
        && this.args.model.certificateRequired && !this.args.model.certificateReceived) {
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
    if (this.hasUnsavedChanges) {
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

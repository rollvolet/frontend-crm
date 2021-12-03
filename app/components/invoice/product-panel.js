import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, keepLatestTask } from 'ember-concurrency';

export default class InvoiceProductPanelComponent extends Component {
  @service documentGeneration;
  @service store;

  @tracked showMissingCertificateDialog = false;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {}

  get sortedInvoicelines() {
    return this.args.model.invoicelines.sortBy('sequenceNumber');
  }

  get isEnabledAddingInvoicelines() {
    return (
      !this.args.model.isBooked &&
      this.args.model.vatRate.get('id') != null &&
      !this.args.isDisabledEdit
    );
  }

  @task
  *addInvoiceline() {
    const lastInvoiceline = this.sortedInvoicelines.lastObject;
    const number = lastInvoiceline ? lastInvoiceline.sequenceNumber : 0;
    const vatRate = yield this.args.model.vatRate;
    const invoiceline = this.store.createRecord('invoiceline', {
      sequenceNumber: number + 1,
      invoice: this.args.model,
      vatRate: vatRate,
    });

    const { validations } = yield invoiceline.validate();
    if (validations.isValid) invoiceline.save();
  }

  @task
  *saveInvoiceline(invoiceline) {
    const { validations } = yield invoiceline.validate();
    if (validations.isValid) yield invoiceline.save();
  }

  @task
  *deleteInvoiceline(invoiceline) {
    if (!invoiceline.isNew) {
      invoiceline.rollbackAttributes();
    }
    yield invoiceline.destroyRecord();
  }

  @task
  *saveDocumentline() {
    if (this.args.model.hasDirtyAttributes) {
      const { validations } = yield this.args.model.validate();
      if (validations.isValid) {
        yield this.args.model.save();
      }
    }
  }

  @task
  *generateInvoiceDocument() {
    if (
      !this.args.model.isCreditNote &&
      !this.showMissingCertificateDialog &&
      this.args.model.certificateRequired &&
      !this.args.model.certificateReceived
    ) {
      this.showMissingCertificateDialog = true;
    } else {
      this.showMissingCertificateDialog = false;
      try {
        yield this.documentGeneration.invoiceDocument(this.args.model);
      } catch (e) {
        warn(`Something went wrong while generating the invoice document`, {
          id: 'document-generation-failure',
        });
      }
    }
  }

  @action
  downloadInvoiceDocument() {
    this.documentGeneration.downloadInvoiceDocument(this.args.model);
  }
}

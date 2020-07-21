import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask, task } from 'ember-concurrency-decorators';
import { warn } from '@ember/debug';

export default class DepositInvoiceListItemComponent extends Component {
  @service documentGeneration

  @tracked vatRate
  @tracked showMissingCertificateDialog = false

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const model = yield this.args.model;
    this.vatRate = yield model.load('vatRate');
  }

  get vatPercentage() {
    return this.vatRate && this.vatRate.rate / 100;
  }

  get baseAmount() {
    return this.args.model.baseAmount;
  }

  get baseAmountVat() {
    return this.baseAmount * this.vatPercentage;
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
  downloadInvoiceDocument() {
    this.documentGeneration.downloadInvoiceDocument(this.args.model);
  }

  @action
  closeCertificateDialog() {
    this.showMissingCertificateDialog = false;
  }
}

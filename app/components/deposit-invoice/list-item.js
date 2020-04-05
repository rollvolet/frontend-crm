import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { warn } from '@ember/debug';

export default class DepositInvoiceListItemComponent extends Component {
  @service documentGeneration

  @tracked showMissingCertificateDialog = false

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
  downloadInvoiceDocument() {
    this.documentGeneration.downloadInvoiceDocument(this.args.model);
  }
}

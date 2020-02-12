import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { warn } from '@ember/debug';

export default class DepositInvoiceListItemComponent extends Component {
  @service documentGeneration

  @task
  *generateInvoiceDocument() {
    const oldInvoiceDate = this.args.model.invoiceDate;
    try {
      this.args.model.invoiceDate = new Date();
      yield this.args.model.save();
      yield this.documentGeneration.invoiceDocument(this.args.model);
    } catch(e) {
      warn(`Something went wrong while generating the invoice document`, { id: 'document-generation-failure' });
      this.args.model.invoiceDate = oldInvoiceDate;
      yield this.args.model.save();
    }
  }

  @action
  downloadInvoiceDocument() {
    this.documentGeneration.downloadInvoiceDocument(this.args.model);
  }

}

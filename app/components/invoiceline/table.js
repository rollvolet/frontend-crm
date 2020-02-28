import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';

export default class InvoicelineTableComponent extends Component {
  @tracked invoicelines = []
  @tracked enrichedInvoicelines = []

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get sortedInvoicelines() {
    return this.enrichedInvoicelines.sortBy('sequenceNumber');
  }

  get invoice() {
    return this.invoicelines.firstObject && this.invoicelines.firstObject.invoice;
  }

  @keepLatestTask
  *loadData() {
    this.invoicelines = yield this.args.model;
    // Load data that is already loaded by the invoice/panel component
    yield all(this.invoicelines.map(line => line.sideload('order,invoice,vat-rate', { backgroundReload: false })));
    const order = this.invoice && (yield this.invoice.order);
    this.enrichedInvoicelines = yield all(this.invoicelines.map(async (line) => {
      line.isSupplement = order && !(await line.get('order'));
      return line;
    }));
  }
}

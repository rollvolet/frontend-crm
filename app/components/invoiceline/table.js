import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task, all } from 'ember-concurrency';

export default class InvoicelineTableComponent extends Component {
  @tracked invoicelines = []

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get sortedInvoicelines() {
    return this.invoicelines.sortBy('sequenceNumber');
  }

  get invoice() {
    return this.invoicelines.firstObject.invoice;
  }

  @(task(function * () {
    this.invoicelines = yield this.args.model;
    // Load data that is already loaded by the invoice/panel component
    yield all(this.invoicelines.map(line => line.sideload('order,invoice,vat-rate', { backgroundReload: false })));
  }).keepLatest())
  loadData
}

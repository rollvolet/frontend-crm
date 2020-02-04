import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class InvoiceDocumentEditComponent extends Component {
  @service store

  @tracked invoicelines = []

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get sortedInvoicelines() {
    return this.invoicelines.sortBy('sequenceNumber');
  }

  get isEnabledAddingInvoicelines() {
    return this.vatRate != null;
  }

  get vatRate() {
    return this.args.model.vatRate;
  }

  @(task(function * () {
    const model = this.args.model;
    // load data that is already loaded by the invoice/panel component
    yield model.load('vatRate', { backgroundReload: false });
    this.invoicelines = yield model.load('invoicelines', { backgroundReload: false });
    yield all(this.invoicelines.map(line => line.sideload('order,invoice,vat-rate')));
  }).keepLatest())
  loadData

  @task(function * () {
    const number = this.invoicelines.length ? Math.max(...this.invoicelines.map(l => l.sequenceNumber)) : 0;
    const invoiceline = this.store.createRecord('invoiceline', {
      sequenceNumber: number + 1,
      order: this.args.model,
      vatRate: this.vatRate
    });
    const { validations } = yield invoiceline.validate();
    if (validations.isValid)
      invoiceline.save();
    this.invoicelines.pushObject(invoiceline);
  })
  addInvoiceline;

  @task(function * (invoiceline) {
    invoiceline.rollbackAttributes();
    this.invoicelines.removeObject(invoiceline);
    yield invoiceline.destroyRecord();
  })
  deleteInvoiceline
}

import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class InvoiceDocumentEditComponent extends Component {
  @service store

  get sortedInvoicelines() {
    return this.args.model.invoicelines.sortBy('sequenceNumber');
  }

  get isEnabledAddingInvoices() {
    return this.args.model.vatRate.content != null;
  }

  @task(function * () {
    const invoicelines = yield this.args.model.invoicelines;
    const number = invoicelines.length ? Math.max(...invoicelines.map(l => l.sequenceNumber)) : 0;
    const vatRate = yield this.args.model.vatRate;
    const invoiceline = this.store.createRecord('invoiceline', {
      sequenceNumber: number + 1,
      invoice: this.args.model,
      vatRate
    });
    const { validations } = yield invoiceline.validate();
    if (validations.isValid)
      invoiceline.save();
  })
  addInvoiceline;

  @task(function * (invoiceline) {
    const invoicelines = yield this.args.model.invoicelines;
    invoicelines.removeObject(invoiceline);
    invoiceline.destroyRecord();
  })
  deleteInvoiceline
}

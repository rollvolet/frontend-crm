import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class MainCustomersEditInvoiceRoute extends Route {
  @service store;
  @service router;

  async model() {
    const customer = this.modelFor('main.customers.edit');
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 21);

    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const invoice = this.store.createRecord('invoice', {
      invoiceDate,
      dueDate,
      certificateRequired: false,
      certificateReceived: false,
      certificateClosed: false,
      isCreditNote: false,
      hasProductionTicket: false,
      customer,
      vatRate,
    });

    await invoice.save();

    // TODO first create case and relate to invoice once relationship is fully defined
    const _case = this.store.createRecord('case', {
      customer: customer.uri,
      invoice: invoice.uri,
    });

    await _case.save();

    return { case: _case, invoice };
  }

  afterModel(model) {
    this.router.transitionTo('main.case.invoice.edit.index', model.case.id, model.invoice.id);
  }
}

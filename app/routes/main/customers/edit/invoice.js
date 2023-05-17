import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { createCustomerSnapshot } from '../../../../utils/invoice-helpers';

export default class MainCustomersEditInvoiceRoute extends Route {
  @service store;
  @service router;
  @service sequence;

  async model() {
    const customer = this.modelFor('main.customers.edit');
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 21);

    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const customerSnap = await createCustomerSnapshot(customer);

    const _case = this.store.createRecord('case', {
      customer: customer.uri,
      vatRate,
    });
    await _case.save();

    const number = await this.sequence.fetchNextInvoiceNumber();
    const invoice = this.store.createRecord('invoice', {
      invoiceDate,
      dueDate,
      number,
      certificateRequired: vatRate.rate == 6,
      certificateReceived: false,
      case: _case,
      customer: customerSnap,
    });

    await invoice.save();

    return { case: _case, invoice };
  }

  afterModel(model) {
    this.router.transitionTo('main.case.invoice.edit.index', model.case.id, model.invoice.id);
  }
}

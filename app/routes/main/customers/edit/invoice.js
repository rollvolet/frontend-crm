import Route from '@ember/routing/route';
import { service } from '@ember/service';
import addDays from 'date-fns/addDays';
import { createCustomerSnapshot } from '../../../../utils/invoice-helpers';
import { createCase } from '../../../../utils/case-helpers';

export default class MainCustomersEditInvoiceRoute extends Route {
  @service store;
  @service router;
  @service sequence;

  async model() {
    const customer = this.modelFor('main.customers.edit');

    const invoiceDate = new Date();
    const dueDate = addDays(invoiceDate, 14);
    const customerSnap = await createCustomerSnapshot(customer);
    const number = await this.sequence.fetchNextInvoiceNumber();

    const invoice = this.store.createRecord('invoice', {
      invoiceDate,
      dueDate,
      number,
      customer: customerSnap,
    });
    await invoice.save();

    const _case = await createCase({
      customer,
      invoice,
    });

    return { case: _case, invoice };
  }

  afterModel(model) {
    this.router.transitionTo('main.case.invoice.edit.index', model.case.id, model.invoice.id);
  }
}

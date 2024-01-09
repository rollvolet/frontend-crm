import Route from '@ember/routing/route';
import { service } from '@ember/service';
import addDays from 'date-fns/addDays';
import sum from '../../../../../utils/math/sum';
import {
  createCustomerSnapshot,
  createContactSnapshot,
  createBuildingSnapshot,
} from '../../../../../utils/invoice-helpers';

export default class InvoiceRoute extends Route {
  @service store;
  @service router;
  @service sequence;

  beforeModel(transition) {
    const order = this.modelFor('main.case.order.edit');

    if (order.isMasteredByAccess) {
      transition.abort();
    }
  }

  async model() {
    const _case = this.modelFor('main.case');
    const order = this.modelFor('main.case.order.edit');
    const [invoicelines, customer, contact, building] = await Promise.all([
      this.store.query('invoiceline', {
        'filter[order][:uri:]': order.uri,
        sort: 'position',
        page: { size: 100 },
      }),
      _case.customer,
      _case.contact,
      _case.building,
    ]);

    const invoiceDate = new Date();
    const dueDate = addDays(invoiceDate, 14);
    const orderAmount = sum(invoicelines.map((line) => line.arithmeticAmount));

    const [customerSnap, contactSnap, buildingSnap] = await Promise.all([
      createCustomerSnapshot(customer),
      createContactSnapshot(contact),
      createBuildingSnapshot(building),
    ]);
    const number = await this.sequence.fetchNextInvoiceNumber();

    const invoice = this.store.createRecord('invoice', {
      invoiceDate,
      dueDate,
      number,
      totalAmountNet: orderAmount,
      case: _case,
      customer: customerSnap,
      contact: contactSnap,
      building: buildingSnap,
    });

    await invoice.save();

    await Promise.all(
      invoicelines.map((invoiceline) => {
        invoiceline.invoice = invoice;
        invoiceline.save();
      })
    );

    return invoice;
  }

  afterModel(model) {
    const _case = this.modelFor('main.case');
    this.router.transitionTo('main.case.invoice.edit', _case.id, model.id);
  }
}

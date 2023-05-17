import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';
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
    // TODO use order.invoicelines once the relation is defined
    const [invoicelines, vatRate, customer, contact, building] = await Promise.all([
      this.store.query('invoiceline', {
        'filter[:exact:order]': _case.order,
        sort: 'position',
        page: { size: 100 },
      }),
      _case.vatRate,
      order.customer,
      order.contact,
      order.building,
    ]);

    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();
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
      certificateRequired: vatRate.rate == 6,
      certificateReceived: false,
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
    this.router.transitionTo('main.case.invoice.edit', _case, model);
  }
}

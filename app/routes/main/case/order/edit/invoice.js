import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class InvoiceRoute extends Route {
  @service case;

  beforeModel(transition) {
    const order = this.modelFor('main.case.order.edit');

    if (order.isMasteredByAccess) {
      transition.abort();
    }
  }

  async model() {
    const order = this.modelFor('main.case.order.edit');
    const invoicelines = await order.invoicelines;
    const vatRate = await order.vatRate;
    const customer = await order.customer;
    const contact = await order.contact;
    const building = await order.building;

    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const invoice = this.store.createRecord('invoice', {
      invoiceDate,
      dueDate,
      certificateRequired: vatRate.rate == 6,
      certificateReceived: false,
      certificateClosed: false,
      isCreditNote: false,
      hasProductionTicket: order.hasProductionTicket,
      reference: order.reference,
      comment: order.comment,
      order,
      customer,
      contact,
      building,
      vatRate,
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
    const customer = this.modelFor('main.case');
    this.transitionTo('main.case.invoice.edit', customer, model);

    // update case to display the new invoice tab
    this.case.updateRecord('invoice', model);
  }
}

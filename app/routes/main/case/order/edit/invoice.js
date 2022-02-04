import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';
import sum from '../../../../../utils/math/sum';

export default class InvoiceRoute extends Route {
  @service case;
  @service store;
  @service router;

  beforeModel(transition) {
    const order = this.modelFor('main.case.order.edit');

    if (order.isMasteredByAccess) {
      transition.abort();
    }
  }

  async model() {
    const order = this.modelFor('main.case.order.edit');
    // TODO use order.invoicelines once the relation is defined
    const invoicelines = await this.store.query('invoiceline', {
      'filter[order]': order.uri,
      sort: 'position',
      page: { size: 100 },
    });
    const vatRate = await order.vatRate;
    const customer = await order.customer;
    const contact = await order.contact;
    const building = await order.building;

    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();
    const baseAmount = sum(invoicelines.map((line) => line.arithmeticAmount));

    const invoice = this.store.createRecord('invoice', {
      invoiceDate,
      dueDate,
      baseAmount,
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
        invoiceline.invoice = invoice.uri;
        invoiceline.save();
      })
    );

    return invoice;
  }

  afterModel(model) {
    const customer = this.modelFor('main.case');
    this.router.transitionTo('main.case.invoice.edit', customer, model);

    // update case to display the new invoice tab
    this.case.updateRecord('invoice', model);
  }
}

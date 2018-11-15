import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default Route.extend({
  case: service(),

  async model() {
    const order = this.modelFor('main.case.order.edit');
    const vatRate = await order.vatRate;
    const offer = await order.offer;
    const offerlines = await offer.offerlines;
    const customer = await order.customer;
    const contact = await order.contact;
    const building = await order.building;

    const orderedOfferlines = offerlines.filterBy('isOrdered');
    const amount = orderedOfferlines.mapBy('amount').reduce((a, b) => a + b, 0);

    const invoiceDate = new Date();
    const dueDate = moment(invoiceDate).add(14, 'days').toDate();

    const invoice = this.store.createRecord('invoice', {
      invoiceDate,
      dueDate,
      baseAmount: amount,
      certificateRequired: vatRate.code == 6,
      certificateReceived: false,
      certificateClosed: false,
      isCreditNote: false,
      hasProductionTicket: order.hasProductionTicket,
      reference: offer.reference,
      comment: order.comment,
      order,
      customer,
      contact,
      building,
      vatRate
    });

    return invoice.save();
  },

  afterModel(model) {
    const customer = this.modelFor('main.case');
    this.transitionTo('main.case.invoice.edit', customer, model, {
      queryParams: { editMode: true }
    });

    // update case to display the new invoice tab
    this.case.set('current.invoiceId', model.get('id'));
  }

});

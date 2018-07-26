import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  case: service(),

  async model() {
    const customer = this.modelFor('main.case');
    const offer = this.modelFor('main.case.offer.edit');
    const contact = await offer.get('contact');
    const building = await offer.get('building');
    const vatRate = await offer.get('vat-rate');
    const order = this.store.createRecord('order', {
      orderDate: new Date(),
      offerNumber: offer.number,
      comment: offer.comment,
      amount: offer.amount,
      depositRequired: false,
      hasProductionTicket: false,
      mustBeInstalled: true,
      mustBeDelivered: false,
      isReady: false,
      canceled: false,
      customer,
      offer,
      contact,
      building,
      vatRate
    });

    return order.save();
  },
  afterModel(model) {
    const customer = this.modelFor('main.case');
    this.transitionTo('main.case.order.edit', customer, model, {
      queryParams: { editMode: true }
    });

    // update case to display the new order tab
    this.case.set('current.orderId', model.get('id'));
  }
});

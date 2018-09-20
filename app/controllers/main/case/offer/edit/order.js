import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task, all } from 'ember-concurrency';
import { any } from 'ember-awesome-macros/array';

export default Controller.extend({
  case: service(),
  store: service(),

  hasSelectedLines: any('model.offerlines.@each.isOrdered', o => o.isOrdered),

  createOrder: task(function * () {
    const offerlines = yield this.model.get('offerlines');
    yield all(offerlines.map(o => o.save()));

    const customer = yield this.model.get('customer');
    const contact = yield this.model.get('contact');
    const building = yield this.model.get('building');
    const vatRate = yield this.model.get('vat-rate');

    const orderedAmount = offerlines.filterBy('isOrdered').mapBy('amount').reduce((a, b) => a + b);

    const order = this.store.createRecord('order', {
      orderDate: new Date(),
      offerNumber: this.model.number,
      comment: this.model.comment,
      scheduledHours: 0,
      scheduledNbOfPersons: 2,
      amount: orderedAmount,
      depositRequired: true,
      hasProductionTicket: false,
      mustBeInstalled: true,
      mustBeDelivered: false,
      isReady: false,
      canceled: false,
      offer: this.model,
      customer,
      contact,
      building,
      vatRate
    });

    yield order.save();

    this.transitionToRoute('main.case.order.edit', customer, order, {
      queryParams: { editMode: true }
    });

    // update case to display the new order tab
    this.case.set('current.orderId', this.model.get('id'));
  }),

  actions: {
    async cancel() {
      const offerlines = await this.model.get('offerlines');
      offerlines.forEach(o => o.set('isOrdered', false));
      const customer = await this.model.get('customer');
      this.transitionToRoute('main.case.offer.edit', customer, this.model);
    }
  }
});

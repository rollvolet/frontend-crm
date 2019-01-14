import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task, all } from 'ember-concurrency';
import { notEmpty, filterBy, mapBy } from '@ember/object/computed';
import { uniqBy, length } from 'ember-awesome-macros/array';
import { gt, or, not, raw } from 'ember-awesome-macros';

export default Controller.extend({
  case: service(),
  store: service(),

  orderedOfferlines: filterBy('model.offerlines', 'isOrdered'),
  hasSelectedLines: notEmpty('orderedOfferlines'),
  vatRates: mapBy('orderedOfferlines', 'vatRate'),
  hasMixedVatRates: gt(length(uniqBy('vatRates', raw('code'))), raw(1)),
  isDisabledCreate: or(not('hasSelectedLines'), 'hasMixedVatRates'),

  createOrder: task(function * () {
    const offerlines = yield this.model.get('offerlines');
    yield all(offerlines.map(o => o.save()));

    const customer = yield this.model.get('customer');
    const contact = yield this.model.get('contact');
    const building = yield this.model.get('building');
    const vatRate = yield this.model.get('vatRate');

    const order = this.store.createRecord('order', {
      orderDate: new Date(),
      requestNumber: this.model.requestNumber,
      offerNumber: this.model.number,
      scheduledHours: 0,
      scheduledNbOfPersons: 2,
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
    this.case.updateRecord('order', this.model);
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

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task, all } from 'ember-concurrency';
import { computed } from '@ember/object';
import { notEmpty, filterBy, mapBy } from '@ember/object/computed';
import { first, uniqBy, length } from 'ember-awesome-macros/array';
import { gt, or, not, raw, sum } from 'ember-awesome-macros';
import DS from 'ember-data';
import { debug } from '@ember/debug';

export default Controller.extend({
  case: service(),
  store: service(),

  showIncompatibleVatRatesDialog: false,

  visitorPromise: computed('model.request.visitor', function() {
    return DS.PromiseObject.create({
      promise: this.model.request.then((request) => {
        return this.store.peekAll('employee').find(e => e.firstName == request.visitor);
      })
    });
  }),
  orderedOfferlines: filterBy('model.offerlines', 'isOrdered'),
  hasSelectedLines: notEmpty('orderedOfferlines'),
  vatRates: mapBy('orderedOfferlines', 'vatRate'),
  hasMixedVatRates: gt(length(uniqBy('vatRates', raw('code'))), raw(1)),
  isDisabledCreate: or(not('hasSelectedLines'), 'hasMixedVatRates'),
  orderedVatRate: first('vatRates'),
  arithmeticOrderedAmounts: mapBy('orderedOfferlines', 'arithmeticAmount'),
  orderedAmount: sum('arithmeticOrderedAmounts'),

  updateOfferVatRate: task(function * () {
    this.set('showIncompatibleVatRatesDialog', false);
    this.model.set('vatRate', this.orderedVatRate);
    yield this.model.save();
    yield this.createOrder.perform();
  }),
  createOrder: task(function * () {
    let vatRate = yield this.model.get('vatRate');

    if (vatRate && this.orderedVatRate && this.orderedVatRate.get('id') != vatRate.get('id')) {
      this.set('showIncompatibleVatRatesDialog', true);
    } else {
      if (!vatRate) {
        vatRate = this.orderedVatRate;
        debug(`Offer doesn't have a VAT rate yet. Updating VAT rate to ordered VAT rate ${this.orderedVatRate.get(`code`)}.`);
        this.model.set('vatRate', vatRate);
        yield this.model.save();
      }

      const offerlines = yield this.model.get('offerlines');
      yield all(offerlines.map(o => o.save()));

      const customer = yield this.model.get('customer');
      const contact = yield this.model.get('contact');
      const building = yield this.model.get('building');

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
    }
  }),

  actions: {
    async cancel() {
      const offerlines = await this.model.get('offerlines');
      offerlines.forEach(o => o.set('isOrdered', false));
      const customer = await this.model.get('customer');
      this.transitionToRoute('main.case.offer.edit', customer, this.model);
    },
    closeIncompatibleVatRatesDialog() {
      this.set('showIncompatibleVatRatesDialog', false);
    }
  }
});

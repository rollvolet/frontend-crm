import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, all } from 'ember-concurrency';
import { gt, or, not, raw, sum, notEmpty, array, promise } from 'ember-awesome-macros';
import { debug } from '@ember/debug';

export default class OrderController extends Controller {
  @service case

  @service store

  showIncompatibleVatRatesDialog = false;

  @promise.object('model.request') request
  @computed('request.visitor')
  get visitor() {
    return this.store.peekAll('employee').find(e => e.firstName == this.request.get('visitor'));
  }
  @promise.array('model.offerlines') offerlines
  @array.filterBy('offerlines', raw('isOrdered')) orderedOfferlines;
  @notEmpty('orderedOfferlines') hasSelectedLines;
  @array.mapBy('orderedOfferlines', raw('vatRate')) vatRates;
  @gt(array.length(array.uniqBy('vatRates', raw('code'))), raw(1)) hasMixedVatRates;
  @or(not('hasSelectedLines'), 'hasMixedVatRates') isDisabledCreate;
  @array.first('vatRates') orderedVatRate;
  @sum(array.mapBy('orderedOfferlines', raw('arithmeticAmount'))) orderedAmount;

  @task(function * () {
    this.closeIncompatibleVatRatesDialog();
    this.model.set('vatRate', this.orderedVatRate);
    yield this.model.save();
    yield this.createOrder.perform();
  })
  updateOfferVatRate;

  @task(function * () {
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

      const customer = yield this.model.get('customer');
      const contact = yield this.model.get('contact');
      const building = yield this.model.get('building');

      const order = this.store.createRecord('order', {
        orderDate: new Date(),
        requestNumber: this.model.requestNumber,
        offerNumber: this.model.number,
        reference: this.model.reference,
        comment: this.model.comment,
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

      const invoicelines = this.orderedOfferlines.map(async (offerline) => {
        const orderline = this.store.createRecord('invoiceline', {
          sequenceNumber: offerline.sequenceNumber,
          description: offerline.description,
          amount: offerline.amount,
          vatRate: vatRate,
          order: order
        });
        await orderline.save();
      });
      yield all(invoicelines);

      this.transitionToRoute('main.case.order.edit', customer, order, {
        queryParams: { editMode: true }
      });

      // update case to display the new order tab
      this.case.updateRecord('order', this.model);
    }
  })
  createOrder;

  @action
  async cancel() {
    const offerlines = await this.model.get('offerlines');
    offerlines.forEach(o => o.set('isOrdered', false));
    const customer = await this.model.get('customer');
    this.transitionToRoute('main.case.offer.edit', customer, this.model);
  }

  @action
  closeIncompatibleVatRatesDialog() {
    this.set('showIncompatibleVatRatesDialog', false);
  }
}

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { all } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { debug } from '@ember/debug';
import sum from '../../../../../utils/math/sum';

export default class OrderController extends Controller {
  @service case
  @service store

  @tracked showIncompatibleVatRatesDialog = false;

  get request() {
    return this.case.current && this.case.current.request;
  }

  get visitor() {
    return this.case.visitor;
  }

  get orderedOfferlines() {
    return this.model.filterBy('isOrdered');
  }

  get hasSelectedLines() {
    return this.orderedOfferlines.length > 0;
  }

  get hasMixedVatRates() {
    return this.orderedOfferlines.mapBy('vatRate').uniqBy('code').length > 1;
  }

  get isDisabledCreate() {
    return !this.hasSelectedLines || this.hasMixedVatRates;
  }

  get orderedVatRate() {
    return this.orderedOfferlines.mapBy('vatRate').firstObject;
  }

  get orderedAmount() {
    return sum(this.orderedOfferlines.mapBy('arithmeticAmount'));
  }

  @task
  *updateOfferVatRate() {
    this.closeIncompatibleVatRatesDialog();
    this.offer.vatRate = this.orderedVatRate;
    yield this.offer.save();
    yield this.createOrder.perform();
  }

  @task
  *createOrder() {
    let vatRate = yield this.offer.get('vatRate');

    if (vatRate && this.orderedVatRate && this.orderedVatRate.get('id') != vatRate.get('id')) {
      this.showIncompatibleVatRatesDialog = true;
    } else {
      if (!vatRate) {
        vatRate = this.orderedVatRate;
        debug(`Offer doesn't have a VAT rate yet. Updating VAT rate to ordered VAT rate ${this.orderedVatRate.get(`code`)}.`);
        this.offer.vatRate = vatRate;
        yield this.offer.save();
      }

      const customer = this.case.current.customer;
      const contact = this.case.current.contact;
      const building = this.case.current.building;

      const order = this.store.createRecord('order', {
        orderDate: new Date(),
        requestNumber: this.offer.requestNumber,
        offerNumber: this.offer.number,
        reference: this.offer.reference,
        comment: this.offer.comment,
        scheduledHours: 0,
        scheduledNbOfPersons: 2,
        depositRequired: true,
        hasProductionTicket: false,
        mustBeInstalled: true,
        mustBeDelivered: false,
        isReady: false,
        canceled: false,
        offer: this.offer,
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
          vatRate,
          order
        });
        await orderline.save();
      });
      yield all(invoicelines);

      this.transitionToRoute('main.case.order.edit', customer, order, {
        queryParams: { editMode: true }
      });

      // update case to display the new order tab
      this.case.updateRecord('order', this.offer);
    }
  }

  @action
  async cancel() {
    this.model.forEach(o => o.isOrdered = false);
    const customer = this.case.current.customer;
    this.transitionToRoute('main.case.offer.edit', customer, this.offer.id);
  }

  @action
  closeIncompatibleVatRatesDialog() {
    this.showIncompatibleVatRatesDialog = false;
  }
}

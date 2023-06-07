import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { all, task } from 'ember-concurrency';
import { debug } from '@ember/debug';
import { isEmpty } from '@ember/utils';
import sum from '../../../../../utils/math/sum';

export default class OrderController extends Controller {
  @service case;
  @service store;
  @service router;

  @tracked isOpenIncompatibleVatRatesModal = false;

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
    this.closeIncompatibleVatRatesModal();
    this.offer.vatRate = this.orderedVatRate;
    yield this.offer.save();
    yield this.createOrder.perform();
  }

  @task
  *createOrder() {
    let vatRate = yield this.offer.get('vatRate');

    if (vatRate && this.orderedVatRate && this.orderedVatRate.get('id') != vatRate.get('id')) {
      this.openIncompatibleVatRatesModal();
    } else {
      if (!vatRate) {
        vatRate = this.orderedVatRate;
        const vatRateCode = this.orderedVatRate.get('code');
        debug(
          `Offer doesn't have a VAT rate yet. Updating VAT rate to ordered VAT rate. ${vatRateCode}.`
        );
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
        scheduledNbOfHours: 0,
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
        vatRate,
      });

      yield order.save();

      // TODO relate case to order once relationship is fully defined
      yield this.case.current.updateRecord('order', order);

      const invoicelines = this.orderedOfferlines.map(async (offerline) => {
        const invoiceline = this.store.createRecord('invoiceline', {
          position: offerline.position,
          description: offerline.description,
          amount: offerline.amount,
          vatRate,
          order: order.uri,
        });
        await invoiceline.save();
      });
      yield all(invoicelines);

      // cleanup empty calculation-lines
      // since they can no longer be removed after the order has been created
      const calculationLinesCleanup = this.model.map(async (offerline) => {
        const calculationLines = await offerline.calculationLines;
        const emptyCalculationLines = calculationLines.filter((calculationLine) => {
          return isEmpty(calculationLine.description) && isEmpty(calculationLine.amount);
        });
        await Promise.all(emptyCalculationLines.map((line) => line.destroyRecord()));
      });
      yield all(calculationLinesCleanup);

      this.router.transitionTo('main.case.order.edit', this.case.current.case.id, order);
    }
  }

  @action
  cancel() {
    this.model.forEach((o) => (o.isOrdered = false));
    const _case = this.case.current.case;
    this.router.transitionTo('main.case.offer.edit', _case.id, this.offer.id);
  }

  openIncompatibleVatRatesModal() {
    this.isOpenIncompatibleVatRatesModal = true;
  }

  @action
  closeIncompatibleVatRatesModal() {
    this.isOpenIncompatibleVatRatesModal = false;
  }
}

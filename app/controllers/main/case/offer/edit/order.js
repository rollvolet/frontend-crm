import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { all, task } from 'ember-concurrency';
import { debug } from '@ember/debug';
import { isEmpty } from '@ember/utils';
import sum from '../../../../../utils/math/sum';

export default class MainCaseOfferEditOrderController extends Controller {
  @service store;
  @service router;

  @tracked isOpenIncompatibleVatRatesModal = false;

  get case() {
    return this.model.case;
  }

  get offer() {
    return this.model.offer;
  }

  get offerlines() {
    return this.model.offerlines;
  }

  get orderedOfferlines() {
    return this.offerlines.filterBy('isOrdered');
  }

  get hasSelectedLines() {
    return this.orderedOfferlines.length > 0;
  }

  get hasMixedVatRates() {
    return this.orderedOfferlines.mapBy('vatRate').uniqBy('uri').length > 1;
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
  *updateCaseVatRate() {
    this.closeIncompatibleVatRatesModal();
    this.case.vatRate = this.orderedVatRate;
    yield this.case.save();
    yield this.createOrder.perform();
  }

  @task
  *createOrder() {
    let vatRate = yield this.case.vatRate;

    if (vatRate && this.orderedVatRate && this.orderedVatRate.get('id') != vatRate.get('id')) {
      this.openIncompatibleVatRatesModal();
    } else {
      if (!vatRate) {
        vatRate = this.orderedVatRate;
        const vatRateCode = this.orderedVatRate.get('code');
        debug(
          `Case doesn't have a VAT rate yet. Updating VAT rate to ordered VAT rate. ${vatRateCode}.`
        );
        this.case.vatRate = vatRate;
        yield this.case.save();
      }

      const order = this.store.createRecord('order', {
        orderDate: new Date(),
        scheduledNbOfHours: 0,
        scheduledNbOfPersons: 2,
        depositRequired: true,
        isReady: false,
        case: this.case,
      });

      yield order.save();

      const invoicelines = this.orderedOfferlines.map(async (offerline) => {
        const invoiceline = this.store.createRecord('invoiceline', {
          position: offerline.position,
          description: offerline.description,
          amount: offerline.amount,
          vatRate,
          order,
        });
        await invoiceline.save();
      });
      yield all(invoicelines);

      // cleanup empty calculation-lines
      // since they can no longer be removed after the order has been created
      const calculationLinesCleanup = this.offerlines.map(async (offerline) => {
        const calculationLines = await offerline.calculationLines;
        const emptyCalculationLines = calculationLines.filter((calculationLine) => {
          return isEmpty(calculationLine.description) && isEmpty(calculationLine.amount);
        });
        await Promise.all(emptyCalculationLines.map((line) => line.destroyRecord()));
      });
      yield all(calculationLinesCleanup);

      this.router.transitionTo('main.case.order.edit', this.case.id, order.id);
    }
  }

  @action
  cancel() {
    this.offerlines.forEach((o) => (o.isOrdered = false));
    this.router.transitionTo('main.case.offer.edit', this.case.id, this.offer.id);
  }

  openIncompatibleVatRatesModal() {
    this.isOpenIncompatibleVatRatesModal = true;
  }

  @action
  closeIncompatibleVatRatesModal() {
    this.isOpenIncompatibleVatRatesModal = false;
  }
}

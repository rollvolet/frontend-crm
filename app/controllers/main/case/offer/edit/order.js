import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked, cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { debug } from '@ember/debug';
import { isEmpty } from '@ember/utils';
import uniqBy from 'lodash/uniqBy';
import { TrackedAsyncData } from 'ember-async-data';
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

  get offerlineContainers() {
    return this.model.offerlineContainers;
  }

  get orderedOfferlines() {
    return this.offerlineContainers.filter((container) => container.isOrdered);
  }

  get hasSelectedLines() {
    return this.orderedOfferlines.length > 0;
  }

  @cached
  get orderedVatRates() {
    return new TrackedAsyncData(
      Promise.all(this.orderedOfferlines.map((container) => container.offerline.vatRate))
    );
  }

  get orderedVatRate() {
    if (this.orderedVatRates.isResolved) {
      return this.orderedVatRates.value[0];
    } else {
      return null;
    }
  }

  get orderedAmount() {
    return sum(this.orderedOfferlines.map((container) => container.offerline.arithmeticAmount));
  }

  get hasMixedVatRates() {
    if (this.orderedVatRates.isResolved) {
      return uniqBy(this.orderedVatRates.value, 'uri').length > 1;
    } else {
      return true;
    }
  }

  get isDisabledCreate() {
    return !this.hasSelectedLines || this.hasMixedVatRates;
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

    if (vatRate && this.orderedVatRate && this.orderedVatRate?.id != vatRate.id) {
      this.openIncompatibleVatRatesModal();
    } else {
      if (!vatRate) {
        vatRate = this.orderedVatRate;
        const vatRateCode = this.orderedVatRate.code;
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
        isReady: false,
        case: this.case,
      });

      yield order.save();

      const invoicelines = this.orderedOfferlines.map(async ({ offerline }) => {
        const invoiceline = this.store.createRecord('invoiceline', {
          position: offerline.position,
          description: offerline.description,
          amount: offerline.amount,
          vatRate,
          order,
        });
        await invoiceline.save();
      });
      yield Promise.all(invoicelines);

      // cleanup empty calculation-lines
      // since they can no longer be removed after the order has been created
      const calculationLinesCleanup = this.offerlineContainers.map(async ({ offerline }) => {
        const calculationLines = await offerline.calculationLines;
        const emptyCalculationLines = calculationLines.filter((calculationLine) => {
          return isEmpty(calculationLine.description) && isEmpty(calculationLine.amount);
        });
        await Promise.all(emptyCalculationLines.map((line) => line.destroyRecord()));
      });
      yield Promise.all(calculationLinesCleanup);

      this.router.transitionTo('main.case.order.edit', this.case.id, order.id);
    }
  }

  @action
  cancel() {
    this.offerlineContainers.forEach((o) => (o.isOrdered = false));
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

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { all, keepLatestTask } from 'ember-concurrency';
import sum from '../../utils/math/sum';

export default class InvoiceCalculationPanelComponent extends Component {
  @service case;
  @service router;

  @tracked isOpenSupplementsModal = false;
  @tracked vatRate;
  @tracked invoicelines = [];
  @tracked supplements = [];
  @tracked depositInvoices = [];
  @tracked deposits = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const model = yield this.args.model;

    this.vatRate = yield model.vatRate;
    this.invoicelines = yield model.invoicelines;
    yield all(
      this.invoicelines.map(async (line) => {
        await line.order;
        await line.invoice;
        await line.vatRate;
      })
    );
    this.supplements = yield model.supplements;
    this.depositInvoices = yield model.depositInvoices;
    this.deposits = yield model.deposits;
  }

  get intervention() {
    return this.case.current && this.case.current.intervention;
  }

  get vatPercentage() {
    return this.vatRate && this.vatRate.rate / 100;
  }

  get baseAmount() {
    if (this.args.model.baseAmount) {
      return this.args.model.baseAmount;
    } else {
      return sum(this.invoicelines.mapBy('arithmeticAmount'));
    }
  }

  get baseAmountVat() {
    return this.baseAmount * this.vatPercentage;
  }

  get supplementsAmount() {
    return sum(this.supplements.mapBy('amount'));
  }

  get supplementsVat() {
    return this.supplementsAmount * this.vatPercentage;
  }

  get totalOrderAmount() {
    return this.baseAmount + this.supplementsAmount;
  }

  get totalOrderVat() {
    return this.totalOrderAmount * this.vatPercentage;
  }

  get depositInvoicesAmount() {
    return sum(this.depositInvoices.mapBy('arithmeticAmount'));
  }

  get depositInvoicesVat() {
    // assumption that all deposit invoices have the same vat rate as the parent invoice
    return this.depositInvoicesAmount * this.vatPercentage;
  }

  get totalNetAmount() {
    return this.totalOrderAmount - this.depositInvoicesAmount;
  }

  get totalVat() {
    return this.totalOrderVat - this.depositInvoicesVat;
  }

  get totalGrossAmount() {
    return this.totalNetAmount + this.totalVat;
  }

  get depositsAmount() {
    return sum(this.deposits.mapBy('amount'));
  }

  get totalToPay() {
    return this.totalGrossAmount - this.depositsAmount;
  }

  @action
  openSupplementsModal() {
    this.isOpenSupplementsModal = true;
  }

  @action
  closeSupplementsModal() {
    this.isOpenSupplementsModal = false;
  }
}

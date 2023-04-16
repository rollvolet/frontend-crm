import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';
import sum from '../../utils/math/sum';

export default class InvoiceCalculationPanelComponent extends Component {
  @service router;
  @service store;

  @tracked case;
  @tracked vatRate;
  @tracked deposits = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const model = yield this.args.model;

    this.case = yield model.case;
    this.vatRate = yield this.case.vatRate;
  }

  get vatPercentage() {
    return this.vatRate && this.vatRate.rate / 100;
  }

  get totalOrderAmount() {
    return this.args.model.totalAmountNet;
  }

  get totalOrderVat() {
    return this.totalOrderAmount * this.vatPercentage;
  }

  get depositInvoicesAmount() {
    return sum(this.case.depositInvoices.mapBy('arithmeticAmount'));
  }

  get depositInvoicesVat() {
    // assumption that all deposit invoices have the same vat rate as the parent invoice
    return this.depositInvoicesAmount * this.vatPercentage;
  }

  get paymentAmountNet() {
    return this.totalOrderAmount - this.depositInvoicesAmount;
  }

  get paymentVat() {
    return this.totalOrderVat - this.depositInvoicesVat;
  }

  get paymentAmountGross() {
    return this.paymentAmountNet + this.paymentVat;
  }

  get depositsAmount() {
    return this.args.model.paidDeposits || 0.0;
  }

  get totalToPay() {
    return this.paymentAmountGross - this.depositsAmount;
  }
}

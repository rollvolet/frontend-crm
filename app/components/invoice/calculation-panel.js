import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import sum from '../../utils/math/sum';

export default class InvoiceCalculationPanelComponent extends Component {
  get isLoading() {
    return this.case.isPending || this.vatRate.isPending || this.depositInvoices.isPending;
  }

  @cached
  get case() {
    return new TrackedAsyncData(this.args.model.case);
  }

  @cached
  get vatRate() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.vatRate);
    } else {
      return null;
    }
  }

  @cached
  get order() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.order);
    } else {
      return null;
    }
  }

  @cached
  get depositInvoices() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.depositInvoices);
    } else {
      return [];
    }
  }

  get hasOrder() {
    return this.order?.isResolved && this.order.value != null;
  }

  get vatPercentage() {
    return this.vatRate.isResolved && this.vatRate.value.rate / 100;
  }

  get totalOrderAmount() {
    // in case of Access a fixed number, otherwise the sum of the invoicelines
    return this.args.model.totalAmountNet;
  }

  get totalOrderVat() {
    return this.totalOrderAmount * this.vatPercentage;
  }

  get depositInvoicesAmount() {
    const depositInvoices = this.depositInvoices.isResolved ? this.depositInvoices.value : [];
    const amounts = depositInvoices.map((invoice) => invoice.arithmeticAmount);
    return sum(amounts);
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

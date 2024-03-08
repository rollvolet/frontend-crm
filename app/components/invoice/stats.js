import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import sum from '../../utils/math/sum';

export default class InvoiceStatsComponent extends Component {
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
  get depositInvoices() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.depositInvoices);
    } else {
      return [];
    }
  }

  get totalAmount() {
    // in case of Access a fixed number, otherwise the sum of the invoicelines
    return this.args.model.totalAmountNet;
  }

  get vatPercentage() {
    return this.vatRate.isResolved && this.vatRate.value.rate / 100;
  }

  get totalVat() {
    // assumption that all invoicelines have the same vatRate as the order
    return this.totalAmount * this.vatPercentage;
  }

  get depositsAmount() {
    return this.args.model.paidDeposits || 0.0;
  }

  get depositInvoicesAmount() {
    const depositInvoices = this.depositInvoices.isResolved ? this.depositInvoices.value : [];
    const amounts = depositInvoices.map((invoice) => invoice.arithmeticAmount);
    return sum(amounts);
  }
}

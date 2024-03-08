import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import sum from '../../utils/math/sum';

export default class OrderStatsComponent extends Component {
  get isLoading() {
    return (
      this.invoicelines.isPending ||
      this.case.isPending ||
      this.vatRate.isPending ||
      this.depositInvoices.isPending
    );
  }

  @cached
  get invoicelines() {
    return new TrackedAsyncData(this.args.model.invoicelines);
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

  @cached
  get invoice() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.invoice);
    } else {
      return null;
    }
  }

  get depositsAmount() {
    return (this.invoice?.isResolved && this.invoice.value?.paidDeposits) || 0.0;
  }

  get totalAmount() {
    if (this.invoicelines.isResolved) {
      return sum(this.invoicelines.value.map((line) => line.arithmeticAmount));
    } else {
      return null;
    }
  }

  get vatPercentage() {
    return this.vatRate.isResolved && this.vatRate.value.rate / 100;
  }

  get totalVat() {
    // assumption that all invoicelines have the same vatRate as the order
    return this.totalAmount * this.vatPercentage;
  }

  get depositInvoicesAmount() {
    const depositInvoices = this.depositInvoices.isResolved ? this.depositInvoices.value : [];
    const amounts = depositInvoices.map((invoice) => invoice.arithmeticAmount);
    return sum(amounts);
  }
}

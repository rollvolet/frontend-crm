import Component from '@glimmer/component';
import { keepLatestTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import sum from '../../utils/math/sum';

export default class InvoiceStatsComponent extends Component {
  @tracked vatRate;
  @tracked invoicelines = [];
  @tracked order = null;
  @tracked deposits = [];
  @tracked depositInvoices = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.vatRate = yield this.args.model.vatRate;
    this.invoicelines = yield this.args.model.invoicelines;
    this.order = yield this.args.model.order;
    if (this.order) {
      this.deposits = yield this.order.deposits;
      this.depositInvoices = yield this.order.depositInvoices;
    }
  }

  get totalAmount() {
    return sum(this.invoicelines.map(line => line.arithmeticAmount));
  }

  get vatPercentage() {
    return this.vatRate && this.vatRate.rate / 100;
  }

  get totalVat() {
    // assumption that all invoicelines have the same vatRate as the order
    return this.totalAmount * this.vatPercentage;
  }

  get depositsAmount() {
    return sum(this.deposits.map(deposit => deposit.arithmeticAmount));
  }

  get depositInvoicesAmount() {
    return sum(this.depositInvoices.map(depositInvoice => depositInvoice.arithmeticAmount));
  }
}

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';
import sum from '../../utils/math/sum';

export default class InvoiceStatsComponent extends Component {
  @service store;

  @tracked vatRate;
  @tracked case = null;
  @tracked deposits = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.case = yield this.args.model.case;
    this.vatRate = yield this.case.vatRate;
  }

  get totalAmount() {
    // in case of Access a fixed number, otherwise the sum of the invoicelines
    return this.args.model.totalAmountNet;
  }

  get vatPercentage() {
    return this.vatRate && this.vatRate.rate / 100;
  }

  get totalVat() {
    // assumption that all invoicelines have the same vatRate as the order
    return this.totalAmount * this.vatPercentage;
  }

  get depositsAmount() {
    return this.args.model.paidDeposits || 0.0;
  }

  get depositInvoicesAmount() {
    return sum(this.case.depositInvoices.mapBy('arithmeticAmount'));
  }
}

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import sum from '../../utils/math/sum';

export default class OrderDocumentViewComponent extends Component {
  @service router

  @tracked vatRate
  @tracked invoicelines = []
  @tracked deposits = []
  @tracked depositInvoices = []

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const model = this.args.model;
    // load data that is already loaded by the order/panel component
    this.vatRate = yield model.load('vatRate', { backgroundReload: false });
    this.invoicelines = yield model.load('invoicelines', { backgroundReload: false });
    this.deposits = yield model.load('deposits', { backgroundReload: false });
    this.depositInvoices = yield model.load('depositInvoices', { backgroundReload: false });
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

  @action
  goToDepositInvoices() {
    this.router.transitionTo('main.case.order.edit.deposit-invoices', this.args.model);
  }
}

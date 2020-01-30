import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import sum from '../../utils/math/sum';

export default class OrderDetailViewComponent extends Component {
  @tracked vatRate
  @tracked deposits = []
  @tracked depositInvoices = []

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @(task(function * () {
    const model = yield this.args.model;
    // TODO also load model.offer.request.visitor?
    // load data that is already loaded by the order/panel component
    this.vatRate = yield model.load('vatRate', { backgroundReload: false });
    this.deposits = yield model.load('deposits', { backgroundReload: false });
    this.depositInvoices = yield model.load('depositInvoices', { backgroundReload: false });
  }).keepLatest())
  loadData

  get depositsAmount() {
    return sum(this.deposits.map(deposit => deposit.amount));
  }

  get depositInvoicesAmount() {
    return sum(this.depositInvoices.map(depositInvoice => depositInvoice.arithmeticAmount));
  }

  get isNbOfPersonsWarning() {
    return this.args.model.scheduledNbOfPersons == 2;
  }

  @action
  goToDepositInvoices() {
    this.router.transitionTo('main.case.order.edit.deposit-invoices', this.args.model);
  }
}

import Component from '@glimmer/component';
import { keepLatestTask } from 'ember-concurrency-decorators';
import sum from '../../utils/math/sum';
import { tracked } from '@glimmer/tracking';

export default class OrderDocumentViewComponent extends Component {
  @tracked vatRate
  @tracked invoicelines = []

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
  }

  get totalAmount() {
    return sum(this.invoicelines.map(line => line.arithmeticAmount));
  }

  get totalVat() {
    // assumption that all invoicelines have the same vatRate as the invoice
    return this.totalAmount * this.vatRate;
  }
}

import Component from '@glimmer/component';
import { keepLatestTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class InvoicelineEditComponent extends Component {
  @tracked order
  @tracked invoice

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get isDisabledEditPrice() {
    return this.order != null && this.invoice != null;
  }

  @keepLatestTask
  *loadData() {
    const model = this.args.model;
    // load data that is already loaded by the invoice/document-edit component
    yield model.load('vatRate', { backgroundReload: false });
    this.order = yield model.load('order', { backgroundReload: false });
    this.invoice = yield model.load('invoice', { backgroundReload: false });
  }

  @keepLatestTask
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid)
      yield this.args.model.save();
  }
}

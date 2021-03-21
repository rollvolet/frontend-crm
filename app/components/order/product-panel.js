import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { keepLatestTask, task } from 'ember-concurrency-decorators';

export default class OrderProductPanelComponent extends Component {
  @service router;
  @service store;
  @service documentGeneration;

  @tracked vatRate;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.vatRate = yield this.args.model.vatRate;
  }

  get sortedInvoicelines() {
    return this.args.model.invoicelines.sortBy('sequenceNumber');
  }

  get isEnabledAddingInvoicelines() {
    return this.vatRate != null && !this.args.isDisabledEdit;
  }

  @task
  *addInvoiceline() {
    const lastInvoiceline = this.sortedInvoicelines.lastObject;
    const number = lastInvoiceline ? lastInvoiceline.sequenceNumber : 0;
    const invoiceline = this.store.createRecord('invoiceline', {
      sequenceNumber: number + 1,
      order: this.args.model,
      vatRate: this.vatRate
    });

    const { validations } = yield invoiceline.validate();
    if (validations.isValid)
      invoiceline.save();
  }

  @task
  *saveInvoiceline(invoiceline) {
    const { validations } = yield invoiceline.validate();
    if (validations.isValid)
      yield invoiceline.save();
  }

  @task
  *deleteInvoiceline(invoiceline) {
    if (!invoiceline.isNew)
      invoiceline.rollbackAttributes();
    yield invoiceline.destroyRecord();
  }
}

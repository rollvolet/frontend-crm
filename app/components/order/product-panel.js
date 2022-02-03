import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { keepLatestTask, task } from 'ember-concurrency';

export default class OrderProductPanelComponent extends Component {
  @service router;
  @service store;
  @service documentGeneration;

  @tracked vatRate;
  @tracked invoicelines = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.vatRate = yield this.args.model.vatRate;

    // TODO use this.args.model.invoicelines once the relation is defined
    const invoicelines = yield this.store.query('invoiceline', {
      'filter[order]': this.args.model.uri,
      sort: 'sequence-number',
      page: { size: 100 },
    });
    this.invoicelines = invoicelines.toArray();
  }

  get sortedInvoicelines() {
    return this.invoicelines.sortBy('sequenceNumber');
  }

  get isEnabledAddingInvoicelines() {
    return this.vatRate != null && !this.args.isDisabledEdit;
  }

  @task
  *addInvoiceline() {
    const number = this.invoicelines.length
      ? Math.max(...this.invoicelines.map((l) => l.sequenceNumber))
      : 0;
    const invoiceline = this.store.createRecord('invoiceline', {
      sequenceNumber: number + 1,
      order: this.args.model.uri,
      vatRate: this.vatRate,
    });

    yield this.saveInvoiceline.perform(invoiceline);

    this.invoicelines.pushObject(invoiceline);
  }

  @task
  *saveInvoiceline(invoiceline) {
    const { validations } = yield invoiceline.validate();
    if (validations.isValid) {
      invoiceline.save();
    }
  }

  @task
  *deleteInvoiceline(invoiceline) {
    this.invoicelines.removeObject(invoiceline);
    if (!invoiceline.isNew) {
      invoiceline.rollbackAttributes();
    }
    yield invoiceline.destroyRecord();
  }
}

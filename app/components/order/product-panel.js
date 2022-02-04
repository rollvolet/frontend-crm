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
      'filter[:exact:order]': this.args.model.uri,
      sort: 'position',
      page: { size: 100 },
    });
    this.invoicelines = invoicelines.toArray();
  }

  get sortedInvoicelines() {
    return this.invoicelines.sortBy('position');
  }

  get isEnabledAddingInvoicelines() {
    return this.vatRate != null && !this.args.isDisabledEdit;
  }

  @task
  *addInvoiceline() {
    const position = this.invoicelines.length
      ? Math.max(...this.invoicelines.map((l) => l.position))
      : 0;
    const invoiceline = this.store.createRecord('invoiceline', {
      position: position + 1,
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

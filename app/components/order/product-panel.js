import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { keepLatestTask, task } from 'ember-concurrency';
import { compare } from '@ember/utils';
import { TrackedArray } from 'tracked-built-ins';

export default class OrderProductPanelComponent extends Component {
  @service store;

  @tracked invoicelines = new TrackedArray([]);

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const invoicelines = yield this.store.query('invoiceline', {
      'filter[order][:uri:]': this.args.model.uri,
      include: 'vat-rate',
      sort: 'position',
      page: { size: 100 },
    });
    this.invoicelines = new TrackedArray(invoicelines);
  }

  get sortedInvoicelines() {
    return this.invoicelines.slice(0).sort((a, b) => compare(a.position, b.position));
  }

  @task
  *addInvoiceline() {
    const position = this.invoicelines.length
      ? Math.max(...this.invoicelines.map((l) => l.position))
      : 0;
    const _case = yield this.args.model.case;
    const vatRate = yield _case.vatRate;
    const invoiceline = this.store.createRecord('invoiceline', {
      position: position + 1,
      order: this.args.model,
      vatRate,
    });

    yield this.saveInvoiceline.perform(invoiceline);

    this.invoicelines.push(invoiceline);
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
    const i = this.invoicelines.indexOf(invoiceline);
    if (i >= 0) {
      this.invoicelines.splice(i, 1);
    }
    if (!invoiceline.isNew) {
      invoiceline.rollbackAttributes();
    }
    yield invoiceline.destroyRecord();
  }
}

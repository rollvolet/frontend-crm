import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, keepLatestTask } from 'ember-concurrency';
import sum from '../../utils/math/sum';

export default class InvoiceProductPanelComponent extends Component {
  @service documentGeneration;
  @service store;

  @tracked invoicelines = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    // TODO use this.args.model.invoicelines once the relation is defined
    const invoicelines = yield this.store.query('invoiceline', {
      'filter[invoice]': this.args.model.uri,
      sort: 'position',
      page: { size: 100 },
    });
    this.invoicelines = invoicelines.toArray();
  }

  get sortedInvoicelines() {
    return this.invoicelines.sortBy('position');
  }

  get isEnabledAddingInvoicelines() {
    return (
      !this.args.model.isBooked &&
      this.args.model.vatRate.get('id') != null &&
      !this.args.isDisabledEdit
    );
  }

  @task
  *addInvoiceline() {
    const position = this.invoicelines.length
      ? Math.max(...this.invoicelines.map((l) => l.position))
      : 0;
    const vatRate = yield this.args.model.vatRate;
    const invoiceline = this.store.createRecord('invoiceline', {
      position: position + 1,
      invoice: this.args.model.uri,
      vatRate: vatRate,
    });

    // save invoiceline and update invoicelines total amount on invoice
    yield this.saveInvoiceline.perform(invoiceline);

    this.invoicelines.pushObject(invoiceline);
  }

  @task
  *saveInvoiceline(invoiceline) {
    const { validations } = yield invoiceline.validate();
    if (validations.isValid) {
      yield invoiceline.save();
      yield this.updateInvoicelinesTotalAmount.perform();
    }
  }

  @task
  *deleteInvoiceline(invoiceline) {
    this.invoicelines.removeObject(invoiceline);
    if (!invoiceline.isNew) {
      invoiceline.rollbackAttributes();
    }
    yield invoiceline.destroyRecord();
    yield this.updateInvoicelinesTotalAmount.perform();
  }

  @task
  *saveDocumentline() {
    if (this.args.model.hasDirtyAttributes) {
      const { validations } = yield this.args.model.validate();
      if (validations.isValid) {
        yield this.args.model.save();
      }
    }
  }

  @task
  *generateInvoiceDocument() {
    try {
      yield this.documentGeneration.invoiceDocument(this.args.model);
    } catch (e) {
      warn(`Something went wrong while generating the invoice document`, {
        id: 'document-generation-failure',
      });
    }
  }

  @action
  downloadInvoiceDocument() {
    this.documentGeneration.downloadInvoiceDocument(this.args.model);
  }

  @keepLatestTask
  *updateInvoicelinesTotalAmount() {
    const invoicelinesAmount = sum(this.invoicelines.map((line) => line.arithmeticAmount));
    this.args.model.baseAmount = invoicelinesAmount;
    if (this.args.model.hasDirtyAttributes) {
      // only save if baseAmount actually changed
      const { validations } = yield this.args.model.validate();
      if (validations.isValid) {
        yield this.args.model.save();
      }
    }
  }
}

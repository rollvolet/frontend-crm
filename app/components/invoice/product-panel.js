import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, keepLatestTask } from 'ember-concurrency';
import sum from '../../utils/math/sum';

export default class InvoiceProductPanelComponent extends Component {
  @service documentGeneration;
  @service store;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    yield this.args.model.hasMany('invoicelines').reload();
  }

  get sortedInvoicelines() {
    return this.args.model.invoicelines.sortBy('position');
  }

  get isEnabledAddingInvoicelines() {
    return (
      !this.args.model.isBooked &&
      this.args.model.case.get('vatRate.id') != null &&
      !this.args.isDisabledEdit
    );
  }

  @task
  *addInvoiceline() {
    const position = this.sortedInvoicelines.length
      ? Math.max(...this.sortedInvoicelines.map((l) => l.position))
      : 0;
    const _case = yield this.args.model.case;
    const vatRate = yield _case.vatRate;
    const invoiceline = this.store.createRecord('invoiceline', {
      position: position + 1,
      invoice: this.args.model,
      vatRate: vatRate,
    });

    // save invoiceline and update invoicelines total amount on invoice
    yield this.saveInvoiceline.perform(invoiceline);
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
      yield this.args.model.belongsTo('document').reload();
    } catch (e) {
      warn(`Something went wrong while generating the invoice document`, {
        id: 'document-generation-failure',
      });
    }
  }

  @action
  async downloadInvoiceDocument() {
    const file = await this.args.model.document;
    this.documentGeneration.previewFile(file);
  }

  @keepLatestTask
  *updateInvoicelinesTotalAmount() {
    const invoicelinesAmount = sum(this.sortedInvoicelines.mapBy('arithmeticAmount'));
    this.args.model.totalAmountNet = invoicelinesAmount;
    if (this.args.model.hasDirtyAttributes) {
      // only save if totalAmountNet actually changed
      const { validations } = yield this.args.model.validate();
      if (validations.isValid) {
        yield this.args.model.save();
      }
    }
  }
}

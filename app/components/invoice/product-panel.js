import Component from '@glimmer/component';
import { action } from '@ember/object';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, keepLatestTask } from 'ember-concurrency';
import { compare } from '@ember/utils';
import { TrackedAsyncData } from 'ember-async-data';
import generateDocument from '../../utils/generate-document';
import previewDocument from '../../utils/preview-document';
import sum from '../../utils/math/sum';
import constants from '../../config/constants';

const { FILE_TYPES } = constants;

export default class InvoiceProductPanelComponent extends Component {
  @service store;

  get isLoading() {
    return this.invoicelines.isPending;
  }

  @cached
  get invoicelines() {
    const promise = (async () => {
      const invoicelines = await this.args.model.hasMany('invoicelines').reload();
      await Promise.all(invoicelines.map((line) => line.vatRate));
      return invoicelines;
    })();
    return new TrackedAsyncData(promise);
  }

  get sortedInvoicelines() {
    if (this.invoicelines.isResolved) {
      return this.invoicelines.value.slice(0).sort((a, b) => compare(a.position, b.position));
    } else {
      return [];
    }
  }

  @cached
  get case() {
    return new TrackedAsyncData(this.args.model.case);
  }

  @cached
  get vatRate() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.vatRate);
    } else {
      return null;
    }
  }

  get isEnabledAddingInvoicelines() {
    return (
      !this.args.model.isBooked &&
      this.vatRate?.isResolved &&
      this.vatRate.value != null &&
      !this.args.isDisabledEdit
    );
  }

  @task
  *addInvoiceline() {
    const position = this.sortedInvoicelines.length
      ? this.sortedInvoicelines[this.sortedInvoicelines.length - 1].position
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
      yield generateDocument(`/invoices/${this.args.model.id}/documents`, {
        record: this.args.model,
      });
    } catch (e) {
      warn(`Something went wrong while generating the invoice document`, {
        id: 'document-generation-failure',
      });
    }
  }

  @action
  downloadInvoiceDocument() {
    previewDocument(FILE_TYPES.INVOICE, this.args.model.uri);
  }

  @keepLatestTask
  *updateInvoicelinesTotalAmount() {
    const amounts = this.sortedInvoicelines.map((line) => line.arithmeticAmount);
    const invoicelinesAmount = sum(amounts);
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

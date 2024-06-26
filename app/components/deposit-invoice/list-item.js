import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked, cached } from '@glimmer/tracking';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import generateDocument from '../../utils/generate-document';
import previewDocument from '../../utils/preview-document';
import constants from '../../config/constants';

const { FILE_TYPES, INVOICE_TYPES } = constants;

export default class DepositInvoiceListItemComponent extends Component {
  @service sequence;

  @tracked isExpanded;
  @tracked editMode;
  @tracked isOpenUnableToDeleteModal = false;

  constructor() {
    super(...arguments);
    this.editMode = this.args.initialEditMode || false;
    this.isExpanded = this.args.initialEditMode || false;
  }

  get fieldId() {
    return `${guidFor(this)}`;
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

  @cached
  get invoice() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.invoice);
    } else {
      return null;
    }
  }

  @cached
  get nextInvoiceNumber() {
    return new TrackedAsyncData(this.sequence.fetchNextInvoiceNumber());
  }

  get vatPercentage() {
    return this.vatRate?.isResolved && this.vatRate.value.rate / 100;
  }

  get netAmount() {
    return this.args.model.totalAmountNet;
  }

  get vatAmount() {
    return this.netAmount * this.vatPercentage;
  }

  get grossAmount() {
    return this.netAmount + this.vatAmount;
  }

  get hasFinalInvoice() {
    return this.invoice?.isResolved && this.invoice.value != null;
  }

  get isLimitedUpdateOnly() {
    return this.args.model.isBooked || this.hasFinalInvoice;
  }

  get isLastInvoice() {
    if (this.nextInvoiceNumber.isResolved) {
      return this.nextInvoiceNumber.value == this.args.model.number + 1;
    } else {
      return false;
    }
  }

  get isEnabledDelete() {
    return (
      this.isLastInvoice &&
      !this.hasFinalInvoice &&
      !this.args.model.isBooked &&
      !this.args.model.isMasteredByAccess &&
      this.case.isResolved &&
      this.case.value.isOngoing
    );
  }

  @action
  setCreditNoteFlag(isCreditNote) {
    this.args.model.type = isCreditNote ? INVOICE_TYPES.CREDIT_NOTE : null;
  }

  @task
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid) {
      yield this.args.model.save();
    }
  }

  @task
  *delete() {
    const nextInvoiceNumber = yield this.sequence.fetchNextInvoiceNumber();
    if (nextInvoiceNumber == this.args.model.number + 1) {
      yield this.args.onDelete(this.args.model);
    } else {
      warn(`Not the last invoice anymore. Unable to destroy.`, { id: 'destroy-failure' });
      this.isOpenUnableToDeleteModal = true;
    }
  }

  @task
  *generateInvoiceDocument() {
    try {
      yield generateDocument(`/deposit-invoices/${this.args.model.id}/documents`, {
        record: this.args.model,
      });
    } catch (e) {
      warn(`Something went wrong while generating the deposit-invoice document`, {
        id: 'document-generation-failure',
      });
    }
  }

  @action
  downloadInvoiceDocument() {
    previewDocument(FILE_TYPES.DEPOSIT_INVOICE, this.args.model.uri);
  }

  @action
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  @action
  openEdit() {
    this.isExpanded = true;
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
    this.args.onCloseEdit(this.args.model);
  }

  @action
  closeUnableToDeleteModal() {
    this.isOpenUnableToDeleteModal = false;
  }
}

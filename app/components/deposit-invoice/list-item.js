import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import { isPresent } from '@ember/utils';
import generateDocument from '../../utils/generate-document';
import previewDocument from '../../utils/preview-document';
import constants from '../../config/constants';

const { FILE_TYPES, INVOICE_TYPES } = constants;

export default class DepositInvoiceListItemComponent extends Component {
  @tracked isExpanded;
  @tracked editMode;

  constructor() {
    super(...arguments);
    this.editMode = this.args.initialEditMode || false;
    this.isExpanded = this.args.initialEditMode || false;
  }

  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  vatRateData = trackedFunction(this, async () => {
    return await this.case?.vatRate;
  });

  get fieldId() {
    return `${guidFor(this)}`;
  }

  get case() {
    return this.caseData.value;
  }

  get vatRate() {
    return this.vatRateData.value;
  }

  get netAmount() {
    return this.args.model.totalAmountNet;
  }

  get vatAmount() {
    return this.netAmount * (this.vatRate?.rate / 100);
  }

  get grossAmount() {
    return this.netAmount + this.vatAmount;
  }

  get hasFinalInvoice() {
    return isPresent(this.case?.invoice.get('id'));
  }

  get isLimitedUpdateOnly() {
    return this.args.model.isBooked || this.hasFinalInvoice;
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
}

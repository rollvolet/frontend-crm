import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { debug, warn } from '@ember/debug';
import { task } from 'ember-concurrency';
import constants from '../../config/constants';

const { INVOICE_TYPES } = constants;

export default class DepositInvoiceListItemComponent extends Component {
  @service documentGeneration;
  @service case;

  @tracked isExpanded;
  @tracked editMode;

  constructor() {
    super(...arguments);
    this.editMode = this.args.initialEditMode || false;
    this.isExpanded = this.args.initialEditMode || false;
  }

  get fieldId() {
    return `${guidFor(this)}`;
  }

  get vatPercentage() {
    return this.args.vatRate && this.args.vatRate.rate / 100;
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

  get isLimitedUpdateOnly() {
    return this.args.model.isBooked || this.args.hasFinalInvoice;
  }

  @action
  setCreditNoteFlag(isCreditNote) {
    this.args.model.type = isCreditNote ? INVOICE_TYPES.CREDIT_NOTE : null;
  }

  @task
  *save() {
    const { validations } = yield this.args.model.validate();
    let requiresOfferReload = false;
    if (validations.isValid) {
      const _case = yield this.args.model.case;
      const changedAttributes = _case.changedAttributes();
      // TODO remove syncing once order is refactored to triplestore
      const fieldsToSyncWithOrder = ['reference', 'comment'];
      const order = this.case.current?.order;
      for (let field of fieldsToSyncWithOrder) {
        if (changedAttributes[field]) {
          if (order) {
            debug(`Syncing ${field} of offer/order with updated ${field} of case`);
            order[field] = _case[field];
            yield order.save();
          }
          requiresOfferReload = true;
        }
      }

      yield this.args.model.save();
      yield _case.save();

      if (order && requiresOfferReload) {
        yield order.belongsTo('offer').reload();
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

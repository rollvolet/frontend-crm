import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';

export default class DepositInvoiceListItemComponent extends Component {
  @service documentGeneration;

  @tracked isExpanded = false;
  @tracked editMode = false;
  @tracked showMissingCertificateDialog = false;

  get fieldId() {
    return `${guidFor(this)}`;
  }

  get vatPercentage() {
    return this.args.vatRate.rate / 100;
  }

  get baseAmount() {
    return this.args.model.baseAmount;
  }

  get baseAmountVat() {
    return this.baseAmount * this.vatPercentage;
  }

  get isLimitedUpdateOnly() {
    return this.args.model.isBooked || this.args.hasFinalInvoice;
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
    if (
      !this.args.model.isCreditNote &&
      !this.showMissingCertificateDialog &&
      this.args.model.certificateRequired &&
      !this.args.model.certificateReceived
    ) {
      this.showMissingCertificateDialog = true;
    } else {
      this.showMissingCertificateDialog = false;
      try {
        yield this.documentGeneration.invoiceDocument(this.args.model);
      } catch (e) {
        warn(`Something went wrong while generating the invoice document`, {
          id: 'document-generation-failure',
        });
      }
    }
  }

  @action
  downloadInvoiceDocument() {
    this.documentGeneration.downloadInvoiceDocument(this.args.model);
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
  }

  @action
  closeCertificateDialog() {
    this.showMissingCertificateDialog = false;
  }
}

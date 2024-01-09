import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { deformatInvoiceNumber, formatInvoiceNumber } from '../../helpers/format-invoice-number';
import constants from '../../config/constants';

const { ACCOUNTANCY_EXPORT_TYPES } = constants;

export default class AccountancyExportForm extends Component {
  @service store;

  @tracked multipleExportEnabled = true;
  @tracked isDryRun = false;
  @tracked model;

  constructor() {
    super(...arguments);
    this.resetModel();
  }

  get formattedFromNumber() {
    return formatInvoiceNumber(this.model.fromNumber);
  }

  get formattedUntilNumber() {
    return formatInvoiceNumber(this.model.untilNumber);
  }

  get isExportDisabled() {
    return this.model.validations.isInvalid || this.startExport.isRunning;
  }

  resetModel() {
    this.model = this.store.createRecord('accountancy-export', {
      date: new Date(),
    });
    this.model.validate();
  }

  @task
  *startExport() {
    this.model.type = this.isDryRun
      ? ACCOUNTANCY_EXPORT_TYPES.DRY_RUN
      : ACCOUNTANCY_EXPORT_TYPES.FINAL;
    yield this.args.onExport(this.model);
    this.resetModel();
  }

  @action
  setFromNumber(event) {
    const number = deformatInvoiceNumber(event.target.value);
    this.model.fromNumber = number;

    if (!this.multipleExportEnabled) {
      this.model.untilNumber = number;
    }

    this.model.validate();
  }

  @action
  setUntilNumber(event) {
    const number = deformatInvoiceNumber(event.target.value);
    this.model.untilNumber = number;

    this.model.validate();
  }

  @action
  toggleMultipleExportEnabled() {
    this.multipleExportEnabled = !this.multipleExportEnabled;

    if (!this.multipleExportEnabled) {
      this.model.untilNumber = this.model.fromNumber;
    }

    this.model.validate();
  }
}

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import {
  deformatInvoiceNumber,
  formatInvoiceNumber,
} from '../../helpers/format-invoice-number';

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
  }

  @task
  *startExport() {
    this.model.isDryRun = this.isDryRun;
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
  }

  @action
  setUntilNumber(event) {
    const number = deformatInvoiceNumber(event.target.value);
    this.model.untilNumber = number;
  }

  @action
  toggleMultipleExportEnabled() {
    this.multipleExportEnabled = !this.multipleExportEnabled;

    if (!this.multipleExportEnabled)
      this.model.untilNumber = this.model.fromNumber;
  }
}

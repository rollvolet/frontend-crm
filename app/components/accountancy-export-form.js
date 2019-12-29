import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { deformatInvoiceNumber, formatInvoiceNumber } from '../helpers/format-invoice-number';

@classic
@classNames('export-panel')
export default class AccountancyExportForm extends Component {
  @service
  store;

  onExport = null;
  multipleExportEnabled = true;

  @computed('model.fromNumber')
  get formattedFromNumber() {
    return formatInvoiceNumber(this.model.fromNumber);
  }

  @computed('model.untilNumber')
  get formattedUntilNumber() {
    return formatInvoiceNumber(this.model.untilNumber);
  }

  init() {
    super.init(...arguments);
    this.initModel();
  }

  initModel() {
    const model = this.store.createRecord('accountancy-export', {
      date: new Date(),
      isDryRun: true
    });
    this.set('model', model);
  }

  @task(function * () {
    yield this.onExport(this.model);
    this.initModel();
  })
  startExport;

  @action
  setFromNumber(formattedNumber) {
    const number = deformatInvoiceNumber(formattedNumber);
    this.model.set('fromNumber', number);

    if (!this.multipleExportEnabled)
      this.model.set('untilNumber', number);
  }

  @action
  setUntilNumber(formattedNumber) {
    const number = deformatInvoiceNumber(formattedNumber);
    this.model.set('untilNumber', number);
  }

  @action
  toggleMultipleExportEnabled() {
    this.set('multipleExportEnabled', !this.multipleExportEnabled);

    if (!this.multipleExportEnabled)
      this.model.set('untilNumber', this.model.fromNumber);
  }
}

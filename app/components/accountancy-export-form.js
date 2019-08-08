import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { deformatInvoiceNumber, formatInvoiceNumber } from '../helpers/format-invoice-number';

export default Component.extend({
  store: service(),

  classNames: ['export-panel'],

  onExport: null,
  multipleExportEnabled: true,

  formattedFromNumber: computed('model.fromNumber', function() {
    return formatInvoiceNumber(this.model.fromNumber);
  }),
  formattedUntilNumber: computed('model.untilNumber', function() {
    return formatInvoiceNumber(this.model.untilNumber);
  }),

  init() {
    this._super(...arguments);
    this.initModel();
  },

  initModel() {
    const model = this.store.createRecord('accountancy-export', {
      date: new Date(),
      isDryRun: true
    });
    this.set('model', model);
  },

  startExport: task(function * () {
    yield this.onExport(this.model);
    this.initModel();
  }),

  actions: {
    setFromNumber(formattedNumber) {
      const number = deformatInvoiceNumber(formattedNumber);
      this.model.set('fromNumber', number);

      if (!this.multipleExportEnabled)
        this.model.set('untilNumber', number);
    },
    setUntilNumber(formattedNumber) {
      const number = deformatInvoiceNumber(formattedNumber);
      this.model.set('untilNumber', number);
    },
    toggleMultipleExportEnabled() {
      this.set('multipleExportEnabled', !this.multipleExportEnabled);

      if (!this.multipleExportEnabled)
        this.model.set('untilNumber', this.model.fromNumber);
    }
  }
});

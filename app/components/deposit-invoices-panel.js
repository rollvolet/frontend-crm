import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { bool } from '@ember/object/computed';
import { sum, mapBy, raw } from 'ember-awesome-macros';
import { warn } from '@ember/debug';

export default Component.extend({
  documentGeneration: service(),

  model: null,
  onCreate: null,
  order: null,
  selected: null,
  showUnsavedChangesDialog: false,
  isDisabledEdit: false,  // passed as argument

  arithmeticAmounts: mapBy('model', raw('arithmeticAmount')),
  arithmeticVats: mapBy('model', raw('arithmeticVat')),
  totalAmount: sum('arithmeticAmounts'),
  totalVat: computed('arithmeticVats', function() {
    return Promise.all(this.arithmeticVats).then(values => {
      return values.reduce((a, b) => a + b, 0);
    });
  }),
  editMode: bool('selected'),

  rollbackTree: task(function * () {
    const rollbackPromises = [];

    this.selected.rollbackAttributes();

    rollbackPromises.push(this.selected.belongsTo('vatRate').reload());

    yield all(rollbackPromises);

    yield this.save.perform(null, { forceSucces: true });
  }),
  save: task(function * (_, { forceSuccess = false } = {} ) {
    if (forceSuccess) return;

    const { validations } = yield this.selected.validate();
    if (validations.isValid) {
      yield this.selected.save();
    }
  }).keepLatest(),

  generateInvoiceDocument: task(function * (invoice) {
    const oldInvoiceDate = invoice.invoiceDate;
    try {
      invoice.set('invoiceDate', new Date());
      yield invoice.save();
      yield this.documentGeneration.invoiceDocument(invoice);
    } catch(e) {
      warn(`Something went wrong while generating the invoice document`, { id: 'document-generation-failure' });
      invoice.set('invoiceDate', oldInvoiceDate);
      yield invoice.save();
    }
  }),

  actions: {
    async createNew() {
      const invoice = await this.onCreate();
      this.set('selected', invoice);
    },
    openEdit(invoice) {
      if (this.selected && this.selected.isNew)
        this.selected.destroyRecord();
      this.set('selected', invoice);
    },
    closeEdit() {
      if (this.selected.isNew || this.selected.validations.isInvalid || this.selected.isError
          || (this.save.last && this.save.last.isError)) {
        this.set('showUnsavedChangesDialog', true);
      } else {
        this.set('selected', null);
      }
    },
    async confirmCloseEdit() {
      await this.rollbackTree.perform();
      this.set('selected', null);
    },
    async remove(invoice) {
      this.model.removeObject(invoice);
      invoice.destroyRecord();
    },
    downloadInvoiceDocument(invoice) {
      this.documentGeneration.downloadInvoiceDocument(invoice);
    }
  }

});

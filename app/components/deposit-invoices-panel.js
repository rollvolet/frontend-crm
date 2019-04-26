import Component from '@ember/component';
import { task, all } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { sum, and, not } from 'ember-awesome-macros';
import { warn } from '@ember/debug';

export default Component.extend({
  documentGeneration: service(),

  model: null,
  onCreate: null,
  order: null,
  selected: null,
  showInvoiceDocumentDialog: false,
  showInvoiceDocumentNotFoundDialog: false,
  showUnsavedChangesDialog: false,
  isDisabledEdit: false,  // passed as argument

  arithmeticAmounts: computed('model', 'model.{[],@each.arithmeticAmount}', function() {
    return this.model ? this.model.map(i => i.arithmeticAmount) : 0;
  }),
  arithmeticVats: computed('model', 'model.{[],@each.arithmeticVat}', function() {
    return this.model ? this.model.map(i => i.arithmeticVat) : 0;
  }),
  totalAmount: sum('arithmeticAmounts'),
  totalVat: computed('arithmeticVats', function() {
    return Promise.all(this.arithmeticVats).then(values => {
      return values.reduce((a, b) => a + b, 0);
    });
  }),
  editMode: and('selected', not('showInvoiceDocumentDialog')),

  uploadCertificate: task(function * (invoice, file) {
    try {
      invoice.set('hasCertificateUploadError', false);
      yield this.documentGeneration.uploadCertificate(invoice, file);
      invoice.set('certificateReceived', true);
      yield invoice.save();
    } catch (e) {
      warn(`Error while uploading certificate: ${e.message || JSON.stringify(e)}`, { id: 'failure.upload' } );
      file.queue.remove(file);
      invoice.set('certificateReceived', false);
      invoice.set('hasCertificateUploadError', true);
    }
  }).enqueue(),

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
    async downloadInvoiceDocument(invoice) {
      const document = await this.documentGeneration.downloadInvoiceDocument(invoice);

      if (!document)
        this.set('showInvoiceDocumentNotFoundDialog', true);
    },
    closeInvoiceDocumentDialog() {
      // showInvoiceDocumentDialog is updated by the component
      this.set('selected', null);
    },
    openInvoiceDocumentDialog(invoice) {
      this.set('selected', invoice);
      this.set('showInvoiceDocumentDialog', true);
    },
    async deleteCertificate(invoice) {
      invoice.set('certificateReceived', false);
      await invoice.save();
    }
  }

});

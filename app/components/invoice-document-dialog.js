import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';

export default Component.extend({
  documentGeneration: service(),

  tagName: '',

  model: null,
  save: null,
  showDialog: false,
  hasCertificateUploadError: false,

  generateInvoice: task(function * () {
    if (!this.model.isCreditNote && this.model.certificateRequired) {
      this.set('showDialog', true);
    } else {
      this.generateDocument.perform();
    }
  }),

  generateDocument: task(function * () {
    const oldInvoiceDate = this.model.invoiceDate;
    try {
      this.model.set('invoiceDate', new Date());
      yield this.save.perform();
      yield this.documentGeneration.invoiceDocument(this.model);
      this.set('showDialog', false);
    } catch(e) {
      warn(`Something went wrong while generating the invoice document`, { id: 'document-generation-failure' });
      this.model.set('invoiceDate', oldInvoiceDate);
      yield this.save.perform();
    }
  }),
  generateCertificate: task(function * () {
    yield this.documentGeneration.certificateTemplate(this.model);
  }),
  uploadCertificate: task(function * (file) {
    try {
      this.set('hasCertificateUploadError', false);
      yield this.documentGeneration.uploadCertificate(this.model, file);
      this.model.set('certificateReceived', true);
      yield this.model.save();
    } catch (e) {
      warn(`Error while uploading certificate: ${e.message || JSON.stringify(e)}`, { id: 'failure.upload' } );
      file.queue.remove(file);
      this.model.set('certificateReceived', false);
      this.set('hasCertificateUploadError', true);
    }
  }).enqueue(),

  actions: {
    close() {
      this.set('showDialog', false);
    }
  }
});

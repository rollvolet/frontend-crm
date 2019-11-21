import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: '',

  documentGeneration: service(),

  hasCertificateUploadError: false,

  generateCertificateTemplate: task(function * () {
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
    async deleteCertificate() {
      this.model.set('certificateReceived', false);
      await this.model.save();
    },
    downloadCertificate() {
      this.documentGeneration.downloadCertificate(this.model);
    }
  }
});

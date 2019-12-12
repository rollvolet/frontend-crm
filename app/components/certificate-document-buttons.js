import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: '',

  documentGeneration: service(),

  hasUploadError: false,

  generateTemplate: task(function * () {
    yield this.documentGeneration.certificateTemplate(this.model);
  }),

  upload: task(function * (file) {
    try {
      this.set('hasUploadError', false);
      yield this.documentGeneration.uploadCertificate(this.model, file);
      this.model.set('certificateReceived', true);
      yield this.model.save();
    } catch (e) {
      warn(`Error while uploading certificate: ${e.message || JSON.stringify(e)}`, { id: 'failure.upload' } );
      file.queue.remove(file);
      this.model.set('certificateReceived', false);
      this.set('hasUploadError', true);
    }
  }).enqueue(),

  actions: {
    async delete() {
      this.model.set('certificateReceived', false);
      await this.model.save();
      this.documentGeneration.deleteCertificate(this.model);
    },
    download() {
      this.documentGeneration.downloadCertificate(this.model);
    }
  }
});

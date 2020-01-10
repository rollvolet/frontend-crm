import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { tagName } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { warn } from '@ember/debug';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';

@classic
@tagName('')
export default class CertificateDocumentButtons extends Component {
  @service
  documentGeneration;

  iconButton = true;
  hasUploadError = false;

  @computed('model.id')
  get fileUploadField() {
    return `certificates-${this.model.id}`;
  }

  @task(function * () {
    yield this.documentGeneration.certificateTemplate(this.model);
  })
  generateTemplate;

  @(task(function * (file) {
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
  }).enqueue())
  upload;

  @action
  async delete() {
    this.model.set('certificateReceived', false);
    await this.model.save();
    this.documentGeneration.deleteCertificate(this.model);
  }

  @action
  download() {
    this.documentGeneration.downloadCertificate(this.model);
  }
}

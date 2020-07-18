import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { enqueueTask, task } from 'ember-concurrency-decorators';
import { warn } from '@ember/debug';

export default class CertificateButtonsComponent extends Component {
  @service documentGeneration;

  @tracked hasUploadError;

  get isRunning() {
    return this.generateTemplate.isRunning || this.upload.isRunning || this.delete.isRunning;
  }

  @task
  *generateTemplate() {
    yield this.documentGeneration.certificateTemplate(this.args.model);
  }

  @enqueueTask
  *upload(file) {
    try {
      this.hasUploadError = false;
      yield this.documentGeneration.uploadCertificate(this.args.model, file);
      this.args.model.certificateReceived = true;
      yield this.args.model.save();
    } catch (e) {
      warn(`Error while uploading certificate: ${e.message || JSON.stringify(e)}`, { id: 'failure.upload' } );
      file.queue.remove(file);
      this.args.model.certificateReceived = false;
      this.hasUploadedError = true;
    }
  }

  @task
  *delete() {
    this.args.model.certificateReceived = false;
    yield this.args.model.save();
    this.documentGeneration.deleteCertificate(this.args.model);
  }

  @action
  download() {
    this.documentGeneration.downloadCertificate(this.args.model);
  }

}

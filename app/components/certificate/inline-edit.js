import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { enqueueTask, task } from 'ember-concurrency-decorators';
import { warn } from '@ember/debug';
import { guidFor } from '@ember/object/internals';

export default class CertificateInlineEditComponent extends Component {
  @service documentGeneration;

  @tracked isOpenRecycleModal = false;
  @tracked isOpenActionMenu = false;

  get uploadFieldName() {
    return `certificates-${guidFor(this)}`;
  }

  get isProcessing() {
    return [
      this.generateTemplate,
      this.deleteCertificate,
      this.uploadCertificate,
      this.recycleCertificate,
    ].find((task) => task.isRunning);
  }

  @task
  *generateTemplate() {
    this.closeActionMenu();
    yield this.documentGeneration.certificateTemplate(this.args.model);
  }

  @task
  *deleteCertificate() {
    this.closeActionMenu();
    this.args.model.certificateReceived = false;
    yield this.args.model.save();
    yield this.documentGeneration.deleteCertificate(this.args.model);
  }

  @enqueueTask
  *uploadCertificate(file) {
    try {
      this.closeActionMenu();
      yield this.documentGeneration.uploadCertificate(this.args.model, file);
      this.args.model.certificateReceived = true;
      yield this.args.model.save();
    } catch (e) {
      warn(`Error while uploading certificate: ${e.message || JSON.stringify(e)}`, {
        id: 'failure.upload',
      });
      if (file.queue) file.queue.remove(file);
      this.args.model.certificateReceived = false;
      throw e;
    }
  }

  @task
  *recycleCertificate(sourceInvoice) {
    try {
      this.closeRecycleModal();
      yield this.documentGeneration.recycleCertificate(sourceInvoice, this.args.model);
      this.args.model.certificateReceived = true;
      yield this.args.model.save();
    } catch (e) {
      warn(`Error while recycling certificate: ${e.message || JSON.stringify(e)}`, {
        id: 'failure.recycle',
      });
      this.args.model.certificateReceived = false;
      throw e;
    }
  }

  @action
  downloadCertificate() {
    this.closeActionMenu();
    this.documentGeneration.downloadCertificate(this.args.model);
  }

  @action
  openRecycleModal() {
    this.closeActionMenu();
    this.isOpenRecycleModal = true;
  }

  @action
  closeRecycleModal() {
    this.isOpenRecycleModal = false;
  }

  @action
  openActionMenu() {
    this.isOpenActionMenu = true;
  }

  @action
  closeActionMenu() {
    this.isOpenActionMenu = false;
  }
}

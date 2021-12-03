import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { warn } from '@ember/debug';
import { guidFor } from '@ember/object/internals';
import { task, enqueueTask } from 'ember-concurrency';

export default class CertificateMissingCertificateModalComponent extends Component {
  @service documentGeneration;

  @tracked isOpenRecycleModal = false;
  @tracked showModalContent = true;

  get uploadFieldName() {
    return `certificates-${guidFor(this)}`;
  }

  get isAddingCertificate() {
    return [this.uploadCertificate, this.recycleCertificate].find((task) => task.isRunning);
  }

  get certificateAddedSuccessfully() {
    return (
      this.args.model.certificateReceived &&
      [this.uploadCertificate, this.recycleCertificate].find((task) => task.lastSuccessful)
    );
  }

  get certificateAdditionFailed() {
    return (
      [this.uploadCertificate, this.recycleCertificate].find(
        (task) => task.last && task.last.isError
      ) != null
    );
  }

  get certificateAttemptExecuted() {
    return this.certificateAddedSuccessfully || this.certificateAdditionFailed;
  }

  @task
  *generateTemplate() {
    yield this.documentGeneration.certificateTemplate(this.args.model);
  }

  @enqueueTask
  *uploadCertificate(file) {
    try {
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
  openRecycleModal() {
    this.isOpenRecycleModal = true;
  }

  @action
  closeRecycleModal() {
    this.isOpenRecycleModal = false;
  }

  @action
  closeModal() {
    this.showModalContent = false;
    later(
      this,
      function () {
        this.args.onClose();
      },
      200
    ); // delay to finish leave CSS animation
  }
}

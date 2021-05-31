import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { warn } from '@ember/debug';

export default class CertificateInlineEditComponent extends Component {
  @service documentGeneration;

  @tracked isOpenRecycleModal = false;

  @task
  *recycleCertificate(sourceInvoice) {
    try {
      yield this.documentGeneration.recycleCertificate(sourceInvoice, this.args.model);
      this.args.model.certificateReceived = true;
      yield this.args.model.save();
      this.closeRecycleModal();
    } catch (e) {
      warn(`Error while recycling certificate: ${e.message || JSON.stringify(e)}`, { id: 'failure.recycle' } );
      this.args.model.certificateReceived = false;
      this.closeRecycleModal();
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
}

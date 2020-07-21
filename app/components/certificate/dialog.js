import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { warn } from '@ember/debug';

export default class CertificateDialogComponent extends Component {
  @service documentGeneration
  @tracked showRecycle = false;

  constructor() {
    super(...arguments);
    this.showRecycle = this.args.showRecycle;
  }

  @task
  *recycle(sourceInvoice) {
    try {
      yield this.documentGeneration.recycleCertificate(sourceInvoice, this.args.model);
      this.args.model.certificateReceived = true;
      yield this.args.model.save();
      this.showRecycle = false;
    } catch (e) {
      warn(`Error while recycling certificate: ${e.message || JSON.stringify(e)}`, { id: 'failure.recycle' } );
      this.args.model.certificateReceived = false;
      this.showRecycle = false;
    }
  }

  @action
  openRecycle() {
    this.showRecycle = true;
  }
}

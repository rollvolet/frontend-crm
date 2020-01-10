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
export default class ProductionTicketButtons extends Component {
  @service
  documentGeneration;

  hasUploadError = false;

  @computed('model.id')
  get fileUploadField() {
    return `production-tickets-${this.model.id}`;
  }

  @task(function * () {
    yield this.documentGeneration.productionTicketTemplate(this.model);
  })
  generateTemplate;

  @(task(function * (file) {
    try {
      this.set('hasUploadError', false);
      yield this.documentGeneration.uploadProductionTicket(this.model, file);
      this.model.set('hasProductionTicket', true);
      yield this.model.save();
    } catch (e) {
      warn(`Error while uploading certificate: ${e.message || JSON.stringify(e)}`, { id: 'failure.upload' } );
      file.queue.remove(file);
      this.model.set('hasProductionTicket', false);
      this.set('hasUploadError', true);
    }
  }).enqueue())
  upload;

  @action
  async delete() {
    this.model.set('hasProductionTicket', false);
    await this.model.save();
    this.documentGeneration.deleteProductionTicket(this.model);
  }

  @action
  download() {
    this.documentGeneration.downloadProductionTicket(this.model);
  }
}

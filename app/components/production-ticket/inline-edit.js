import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { enqueueTask, task } from 'ember-concurrency-decorators';
import { warn } from '@ember/debug';
import { guidFor } from '@ember/object/internals';

export default class ProductionTicketInlineEditComponent extends Component {
  @service documentGeneration;

  @tracked isOpenActionMenu = false;

  get uploadFieldName() {
    return `production-tickets-${guidFor(this)}`;
  }

  get isProcessing() {
    return [
      this.generateTemplate,
      this.deleteProductionTicket,
      this.uploadProductionTicket
    ].find(task => task.isRunning);
  }

  @task
  *generateTemplate() {
    this.closeActionMenu();
    yield this.documentGeneration.productionTicketTemplate(this.args.model);
  }

  @task
  *deleteProductionTicket() {
    this.closeActionMenu();
    this.args.model.hasProductionTicket = false;
    yield this.args.model.save();
    yield this.documentGeneration.deleteProductionTicket(this.args.model);
  }

  @enqueueTask
  *uploadProductionTicket(file) {
    try {
      this.closeActionMenu();
      yield this.documentGeneration.uploadProductionTicket(this.args.model, file);
      this.args.model.hasProductionTicket = true;
      yield this.args.model.save();
    } catch (e) {
      warn(`Error while uploading production ticket: ${e.message || JSON.stringify(e)}`, { id: 'failure.upload' } );
      if (file.queue)
        file.queue.remove(file);
      this.args.model.hasProductionTicket = false;
      throw e;
    }
  }

  @action
  downloadProductionTicket() {
    this.closeActionMenu();
    this.documentGeneration.downloadProductionTicket(this.args.model);
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

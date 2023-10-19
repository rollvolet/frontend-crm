import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';
import { guidFor } from '@ember/object/internals';
import { enqueueTask, task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import generateDocument from '../../utils/generate-document';
import previewDocument from '../../utils/preview-document';
import constants from '../../config/constants';

const { FILE_TYPES } = constants;

export default class ProductionTicketInlineEditComponent extends Component {
  @service documentGeneration;

  @tracked isOpenActionMenu = false;

  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  get uploadFieldName() {
    return `production-tickets-${guidFor(this)}`;
  }

  get isProcessing() {
    return [this.generateTemplate, this.deleteProductionTicket, this.uploadProductionTicket].find(
      (task) => task.isRunning
    );
  }

  get case() {
    return this.caseData.value;
  }

  @task
  *generateTemplate() {
    this.closeActionMenu();
    try {
      yield generateDocument(`/cases/${this.case.id}/production-ticket-templates`);
    } catch (e) {
      warn(`Something went wrong while generating the production ticket template`, {
        id: 'document-generation-failure',
      });
    }
  }

  @enqueueTask
  *uploadProductionTicket(file) {
    this.closeActionMenu();
    try {
      yield file.upload(`/cases/${this.case.id}/production-tickets`);
      this.case.hasProductionTicket = true;
      yield this.case.save();
    } catch (e) {
      warn(`Error while uploading production ticket: ${e.message || JSON.stringify(e)}`, {
        id: 'failure.upload',
      });
      if (file.queue) {
        file.queue.remove(file);
      }
      this.case.hasProductionTicket = false;
      throw e;
    }
  }

  @task
  *deleteProductionTicket() {
    this.closeActionMenu();
    this.case.hasProductionTicket = false;
    yield this.case.save();
    yield fetch(
      encodeURI(`/downloads?type=${FILE_TYPES.PRODUCTION_TICKET}&resource=${this.case.uri}`),
      {
        method: 'DELETE',
      }
    );
  }

  @action
  downloadProductionTicket() {
    this.closeActionMenu();
    previewDocument(FILE_TYPES.PRODUCTION_TICKET, this.case.uri);
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

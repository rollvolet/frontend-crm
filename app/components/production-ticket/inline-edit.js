import Component from '@glimmer/component';
import { action } from '@ember/object';
import { warn } from '@ember/debug';
import { guidFor } from '@ember/object/internals';
import { enqueueTask, task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import generateDocument from '../../utils/generate-document';
import previewDocument from '../../utils/preview-document';
import constants from '../../config/constants';

const { FILE_TYPES } = constants;

export default class ProductionTicketInlineEditComponent extends Component {
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
    previewDocument(FILE_TYPES.PRODUCTION_TICKET, this.case.uri);
  }
}

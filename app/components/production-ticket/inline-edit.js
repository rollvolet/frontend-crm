import Component from '@glimmer/component';
import { action } from '@ember/object';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { warn } from '@ember/debug';
import { guidFor } from '@ember/object/internals';
import { enqueueTask, task } from 'ember-concurrency';
import generateDocument from '../../utils/generate-document';
import previewDocument from '../../utils/preview-document';
import constants from '../../config/constants';

const { FILE_TYPES } = constants;

export default class ProductionTicketInlineEditComponent extends Component {
  @cached
  get case() {
    return new TrackedAsyncData(this.args.model.case);
  }

  get uploadFieldName() {
    return `production-tickets-${guidFor(this)}`;
  }

  get isLoading() {
    return this.case.isPending;
  }

  get isProcessing() {
    return [this.generateTemplate, this.deleteProductionTicket, this.uploadProductionTicket].find(
      (task) => task.isRunning
    );
  }

  @task
  *generateTemplate() {
    try {
      const _case = yield this.args.model.case;
      yield generateDocument(`/cases/${_case.id}/production-ticket-templates`);
    } catch (e) {
      warn(`Something went wrong while generating the production ticket template`, {
        id: 'document-generation-failure',
      });
    }
  }

  @enqueueTask
  *uploadProductionTicket(file) {
    const _case = yield this.args.model.case;
    try {
      yield file.upload(`/cases/${_case.id}/production-tickets`);
      _case.hasProductionTicket = true;
      yield _case.save();
    } catch (e) {
      warn(`Error while uploading production ticket: ${e.message || JSON.stringify(e)}`, {
        id: 'failure.upload',
      });
      if (file.queue) {
        file.queue.remove(file);
      }
      _case.hasProductionTicket = false;
      throw e;
    }
  }

  @task
  *deleteProductionTicket() {
    const _case = yield this.args.model.case;
    _case.hasProductionTicket = false;
    yield _case.save();
    yield fetch(
      encodeURI(`/downloads?type=${FILE_TYPES.PRODUCTION_TICKET}&resource=${_case.uri}`),
      {
        method: 'DELETE',
      }
    );
  }

  @action
  async downloadProductionTicket() {
    const _case = await this.args.model.case;
    previewDocument(FILE_TYPES.PRODUCTION_TICKET, _case.uri);
  }
}

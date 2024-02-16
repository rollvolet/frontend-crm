import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';
import { enqueueTask, keepLatestTask, task, timeout } from 'ember-concurrency';
import fetch, { Headers } from 'fetch';
import { previewFile } from '../../utils/preview-document';
import constants from '../../config/constants';

const { PRODUCTION_TICKET } = constants.FILE_TYPES;

export default class CaseAttachmentsPanelComponent extends Component {
  @service store;

  @tracked attachments = [];

  constructor() {
    super(...arguments);
    this.initializeAttachments.perform();
  }

  @keepLatestTask
  *loadAttachments() {
    this.attachments = yield this.store.query('file', {
      'filter[case][:uri:]': this.args.model.uri,
      'filter[:not:type]': PRODUCTION_TICKET,
      page: {
        size: 100,
      },
      sort: '-created',
    });
  }

  // 2 alias-methods for loadAttachments because we only want to show
  // a loading state during initialization and not during reload
  @keepLatestTask
  *initializeAttachments() {
    yield this.loadAttachments.perform();
  }

  @keepLatestTask
  *reloadAttachments() {
    yield this.loadAttachments.perform();
  }

  @enqueueTask({ maxConcurrency: 3 })
  *uploadAttachment(file) {
    const caseId = this.args.model.id;
    try {
      yield file.upload(`/cases/${caseId}/attachments`);
      const currentNbOfAttachments = this.attachments.length;
      while (currentNbOfAttachments == this.attachments.length) {
        yield timeout(250); // make sure async cache got invalidated in backend
        yield this.loadAttachments.perform();
      }
    } catch (e) {
      warn(`Error while uploading attachment: ${e.message || JSON.stringify(e)}`, {
        id: 'failure.upload',
      });
      if (file.queue) {
        file.queue.remove(file);
      }
      throw e;
    }
  }

  @task
  *deleteAttachment(file) {
    const currentNbOfAttachments = this.attachments.length;
    file.deleteRecord(); // mark as deleted in ember-data store
    const result = yield fetch(`/files/${file.id}`, {
      method: 'DELETE',
      headers: new Headers({
        Accept: 'application/vnd.api+json',
      }),
    });

    if (result.ok) {
      while (currentNbOfAttachments == this.attachments.length) {
        yield timeout(100); // make sure async cache got invalidated in backend
        yield this.loadAttachments.perform();
      }
    } else {
      throw result;
    }
  }

  @task
  *downloadAttachment(file) {
    yield previewFile(file);
  }
}

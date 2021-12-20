import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';
import { enqueueTask, task, timeout } from 'ember-concurrency';
import fetch, { Headers } from 'fetch';

export default class CaseAttachmentsPanelComponent extends Component {
  @service store;

  @tracked attachments = [];

  constructor() {
    super(...arguments);
    this.loadAttachments.perform();
  }

  @task
  *loadAttachments() {
    this.attachments = yield this.store.query('file', {
      'filter[case][:uri:]': this.args.caseDispatcher.uri,
      page: {
        size: 100,
      },
      sort: 'created',
    });
  }

  @enqueueTask
  *uploadAttachment(file) {
    const caseId = this.args.caseDispatcher.identifier;
    try {
      yield file.upload(`/cases/${caseId}/attachments`);
      yield timeout(1000); // make sure async cache got invalidated in backend
      yield this.loadAttachments.perform();
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
    const result = yield fetch(`/files/${file.id}`, {
      method: 'DELETE',
      headers: new Headers({
        Accept: 'application/vnd.api+json',
      }),
    });

    if (result.ok) {
      yield timeout(500); // make sure async cache got invalidated in backend
      yield this.loadAttachments.perform();
    } else {
      throw result;
    }
  }

  @task
  *downloadAttachment(file) {
    const result = yield fetch(`/files/${file.id}/download`);

    if (result.ok) {
      const downloadUrl = result.headers.get('Location');
      window.open(downloadUrl);
    }
  }
}

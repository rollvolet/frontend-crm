import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { warn } from '@ember/debug';

export default class CustomerPanelsComponent extends Component {
  get hasNoRequestsOrInvoices() {
    return isEmpty(this.args.model.requests) && isEmpty(this.args.model.invoices);
  }

  get hasNoContactsOrBuildings() {
    return isEmpty(this.args.model.contacts) && isEmpty(this.args.model.buildings);
  }

  get isEnabledDelete() {
    return this.hasNoRequestsOrInvoices && this.hasNoContactsOrBuildings;
  }

  @task
  *delete() {
    try {
      const telephones = yield this.args.model.telephones;
      yield all(telephones.map(t => t.destroyRecord()));
      yield this.args.model.destroyRecord();
    } catch (e) {
      warn(`Something went wrong while destroying customer ${this.args.model.id}`, { id: 'destroy-failure' });
    } finally {
      this.args.onDidDelete();
    }
  }
}

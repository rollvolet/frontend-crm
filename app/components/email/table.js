import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task, keepLatestTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { compare } from '@ember/utils';
import { TrackedArray } from 'tracked-built-ins';

export default class EmailTableComponent extends Component {
  @service store;

  @tracked scope = this.args.scope || 'customer'; // one of 'customer', 'contact', 'building'
  @tracked emails = new TrackedArray([]);

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    // Reset dangling edit modes
    this.emails.forEach((email) => delete email.initialEditMode);
  }

  get isScopeCustomer() {
    return this.scope == 'customer';
  }

  @keepLatestTask
  *loadData() {
    // TODO increase page size [?]
    const emails = yield this.args.model.emails;
    const sortedEmails = emails.slice(0).sort((a, b) => compare(a.value, b.value));
    this.emails = new TrackedArray(sortedEmails);
  }

  @task
  *addEmail() {
    const email = this.store.createRecord('email', {
      [`${this.scope}`]: this.args.model,
    });
    email.initialEditMode = true;

    yield this.saveEmail.perform(email);

    this.emails.push(email);
  }

  @task
  *saveEmail(email) {
    const { validations } = yield email.validate();
    if (validations.isValid) {
      yield email.save();
    }
  }

  @task
  *deleteEmail(email) {
    const i = this.emails.indexOf(email);
    if (i >= 0) {
      this.emails.splice(i, 1);
    }
    if (!email.isDeleted) {
      yield email.destroyRecord();
    }
  }
}

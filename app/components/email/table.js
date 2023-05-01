import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task, keepLatestTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class EmailTableComponent extends Component {
  @service store;

  @tracked scope = this.args.scope || 'customer'; // one of 'customer', 'contact', 'building'
  @tracked emails = [];

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
    const filterKey = `filter[:exact:${this.scope}]`;
    // TODO use this.args.model.emails once the relation is defined
    const emails = yield this.store.query('email', {
      [filterKey]: this.args.model.uri,
      sort: 'value',
      page: { size: 100 },
    });
    this.emails = emails.toArray();
  }

  @task
  *addEmail() {
    const email = this.store.createRecord('email', {
      [`${this.scope}`]: this.args.model.uri,
    });
    email.initialEditMode = true;

    yield this.saveEmail.perform(email);

    this.emails.pushObject(email);
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
    this.emails.removeObject(email);
    if (!email.isDeleted) {
      yield email.destroyRecord();
    }
  }
}

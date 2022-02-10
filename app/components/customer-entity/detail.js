import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask } from 'ember-concurrency';

export default class CustomerEntityDetailComponent extends Component {
  @service store;

  @tracked scope = this.args.scope || 'customer'; // one of 'customer', 'contact', 'building'
  @tracked isMemoExpanded = false;
  @tracked tags = [];
  @tracked telephones = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get isScopeCustomer() {
    return this.scope == 'customer';
  }

  get joinedTagNames() {
    return this.tags.map((t) => t.name).join(', ');
  }

  @keepLatestTask
  *loadData() {
    if (this.isScopeCustomer) {
      this.tags = yield this.args.model.tags;
    }

    // TODO use this.args.model.telephones once the relation is defined
    const filterKey = `filter[${this.scope}]`;
    const telephones = yield this.store.query('telephone', {
      [filterKey]: this.args.model.uri,
      sort: 'position',
      page: { size: 100 },
    });
    this.telephones = telephones.toArray();
  }

  @action
  toggleMemo() {
    this.isMemoExpanded = !this.isMemoExpanded;
  }
}

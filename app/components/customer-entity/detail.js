import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask } from 'ember-concurrency-decorators';

export default class CustomerEntityDetailComponent extends Component {
  @tracked scope = this.args.scope || 'customer'; // one of 'customer', 'contact', 'building'
  @tracked isMemoExpanded = false;
  @tracked tags = [];

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
  }

  @action
  toggleMemo() {
    this.isMemoExpanded = !this.isMemoExpanded;
  }
}

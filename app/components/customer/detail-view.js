import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency-decorators';

export default class CustomerDetailViewComponent extends Component {
  @tracked memoExpanded = false
  @tracked tags = []

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.tags = yield this.args.model.tags;
  }

  get joinedTagNames() {
    return this.tags.map(t => t.name).join(', ');
  }
}

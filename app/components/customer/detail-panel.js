import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask, task } from 'ember-concurrency-decorators';

export default class CustomerDetailPanelComponent extends Component {
  @tracked editMode = false;
  @tracked isMemoExpanded = false;
  @tracked tags = [];

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

  @action
  toggleMemo() {
    this.isMemoExpanded = !this.isMemoExpanded;
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
  }
}

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';

export default class InputFieldUserGroupsSelectComponent extends Component {
  @service store;

  @tracked options = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.options = yield this.store.queryAll('user-group', {
      sort: 'name',
    });
  }

  get required() {
    return this.args.required || false;
  }

  get sortedOptions() {
    return this.options.sortBy('name');
  }

  @action
  updateValue(option, isChecked) {
    const values = this.args.value.slice(0);
    if (isChecked && !values.includes(option)) {
      values.push(option);
    } else if (!isChecked && values.includes(option)) {
      const i = values.indexOf(option);
      values.splice(i, 1);
    }
    this.args.onSelectionChange(values);
  }
}

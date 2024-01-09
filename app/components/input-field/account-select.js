import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';

export default class InputFieldAccountSelectComponent extends Component {
  @service store;

  @tracked options = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.options = yield this.store.queryAll('account', {
      sort: 'account-name',
      'filter[user][:has-no:employee]': 't',
    });
  }

  get required() {
    return this.args.required || false;
  }

  get placeholder() {
    return this.required && this.args.label ? `${this.args.label} *` : this.args.label;
  }
}

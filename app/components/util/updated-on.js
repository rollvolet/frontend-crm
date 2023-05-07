import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency';

export default class UtilUpdatedOnComponent extends Component {
  @service store;

  @tracked by;

  constructor() {
    super(...arguments);
    if (this.args.by) {
      this.by = this.args.by;
    } else if (this.args.user) {
      this.loadUser.perform();
    }
  }

  @keepLatestTask
  *loadUser() {
    const user = yield this.store.findRecordByUri('user', this.args.user);
    this.by = user?.firstName;
  }
}

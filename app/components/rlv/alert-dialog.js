import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

export default class RlvAlertDialogComponent extends Component {
  @task
  *confirm() {
    yield this.args.onConfirm(...arguments);
  }
}

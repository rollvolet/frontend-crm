import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

export default class RlvAddToListButtonComponent extends Component {
  @task
  *click() {
    yield this.args.onClick(...arguments);
  }
}

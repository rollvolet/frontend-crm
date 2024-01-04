import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class CustomerMergeBlockComponent extends Component {
  @action
  toggleStatus(unit) {
    this.args.block.toggleStatus(unit);
  }
}

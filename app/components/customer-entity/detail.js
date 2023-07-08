import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CustomerEntityDetailComponent extends Component {
  @tracked scope = this.args.scope || 'customer'; // one of 'customer', 'contact', 'building'
  @tracked isMemoExpanded = false;

  get isScopeCustomer() {
    return this.scope == 'customer';
  }

  @action
  toggleMemo() {
    this.isMemoExpanded = !this.isMemoExpanded;
  }
}

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

export default class OrderCancellationModalComponent extends Component {
  @tracked cancellationReason;

  get isValid() {
    return isPresent(this.cancellationReason);
  }

  @action
  setCancellationReason(event) {
    this.cancellationReason = event.target.value;
  }
}

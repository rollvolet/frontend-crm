import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class InterventionCancellationModalComponent extends Component {
  @tracked cancellationReason;

  @action
  setCancellationReason(event) {
    this.cancellationReason = event.target.value;
  }
}

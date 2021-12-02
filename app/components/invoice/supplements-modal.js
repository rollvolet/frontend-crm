import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later } from '@ember/runloop';

export default class InvoiceSupplementsModalComponent extends Component {
  @tracked showModalContent = true;

  @action
  closeModal() {
    this.showModalContent = false;
    later(
      this,
      function () {
        this.args.onClose();
      },
      200
    ); // delay to finish leave CSS animation
  }
}

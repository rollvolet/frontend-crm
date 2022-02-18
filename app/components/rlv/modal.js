import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';
import { action } from '@ember/object';

export default class RkbModalComponent extends Component {
  @tracked showModalContent = true;

  get width() {
    return this.args.width || 'sm:max-w-lg sm:w-full';
  }

  @action
  closeModal() {
    this.showModalContent = false;
    if (this.args.onClose) {
      later(
        this,
        function () {
          this.args.onClose();
        },
        200
      ); // delay to finish leave CSS animation
    }
  }
}

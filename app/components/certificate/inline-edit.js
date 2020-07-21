import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CertificateInlineEditComponent extends Component {
  @tracked showRecycleDialog

  @action
  openRecycle() {
    this.showRecycleDialog = true;
  }

  @action
  closeDialog() {
    this.showRecycleDialog = false;
  }
}

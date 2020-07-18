import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CertificateDialogComponent extends Component {
  @tracked showRecycle = false;

  @action
  openRecycle() {
    this.showRecycle = true;
  }
}

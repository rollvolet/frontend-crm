import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class RlvActionMenuComponent extends Component {
  @tracked isOpenActionMenu = false;

  @action
  openActionMenu() {
    this.isOpenActionMenu = true;
  }

  @action
  closeActionMenu() {
    this.isOpenActionMenu = false;
  }
}

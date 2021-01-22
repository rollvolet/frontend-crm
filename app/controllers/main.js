import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MainController extends Controller {
  @service configuration;
  @service session;
  @service userInfo;

  @tracked isOpenMenu = false;

  @action
  logout() {
    this.session.invalidate();
  }

  @action
  openMenu() {
    this.isOpenMenu = true;
  }

  @action
  closeMenu() {
    this.isOpenMenu = false;
  }
}

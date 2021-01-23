import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';

export default class MainController extends Controller {
  @service configuration;
  @service session;
  @service userInfo;

  @tracked isOpenMenu = false;
  @tracked showMenuContent = false;

  @action
  logout() {
    this.session.invalidate();
  }

  @action
  openMenu() {
    this.isOpenMenu = true;
    this.showMenuContent = true;
  }

  @action
  closeMenu() {
    this.showMenuContent = false;
    later(this, function() {
      this.isOpenMenu = false;
    }, 300); // delay to finish leave CSS animation
  }
}

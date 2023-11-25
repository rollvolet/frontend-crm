import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';

export default class MainController extends Controller {
  @service codelist;
  @service router;
  @service session;
  @service userInfo;

  @tracked isOpenMenu = false;
  @tracked showMenuContent = false;

  constructor() {
    super(...arguments);
    this.router.on('routeWillChange', () => this.closeMenu());
  }

  get isLoading() {
    return this.codelist.load.isRunning;
  }

  get applicationInitializationFailed() {
    return this.codelist.load.isError;
  }

  get isIndexPage() {
    return this.router.currentRouteName == 'main.index';
  }

  get hasTopBanner() {
    return !this.userInfo.employee || this.userInfo.isImpersonation;
  }

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
    later(
      this,
      function () {
        this.isOpenMenu = false;
      },
      300
    ); // delay to finish leave CSS animation
  }
}

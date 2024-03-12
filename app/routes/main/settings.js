import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MainSettingsRoute extends Route {
  @service userInfo;

  beforeModel() {
    if (!this.userInfo.isBoard) {
      this.router.transitionTo('forbidden');
    }
  }
}

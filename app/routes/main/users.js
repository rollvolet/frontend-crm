import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainUsersRoute extends Route {
  @service userInfo;

  beforeModel() {
    if (!this.userInfo.isBoard) {
      this.router.transitionTo('forbidden');
    }
  }
}

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainRoute extends Route {
  @service session;
  @service userInfo;

  beforeModel(transition) {
    const isAuthenticated = this.session.requireAuthentication(transition, 'login');

    if (isAuthenticated) {
      return this.userInfo.fetchUserInfo.perform();
    } else {
      return null;
    }
  }
}

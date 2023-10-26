import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainRoute extends Route {
  @service session;
  @service userInfo;
  @service configuration;

  async beforeModel(transition) {
    const isAuthenticated = this.session.requireAuthentication(transition, 'login');

    if (isAuthenticated) {
      // Non blocking requests. Loading state will be shown in template.
      this.configuration.preloadStaticLists.perform();

      // Blocking request
      await this.userInfo.fetchUserInfo.perform();
    }
  }
}

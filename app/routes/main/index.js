import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MainIndexRoute extends Route {
  @service userInfo;

  afterModel() {
    return this.userInfo.employee; // ensure data gets loaded
  }
}

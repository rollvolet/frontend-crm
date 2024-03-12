import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MainSettingsIndexRoute extends Route {
  @service router;

  beforeModel() {
    this.router.transitionTo('main.settings.customer-keywords');
  }
}

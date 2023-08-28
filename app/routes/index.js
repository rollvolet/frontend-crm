import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;
  @service session;

  beforeModel() {
    this.router.transitionTo('main.index');
  }
}

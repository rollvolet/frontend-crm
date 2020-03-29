import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OopsRoute extends Route {
  @service appState

  beforeModel() {
    if (!this.appState.lastError)
      this.transitionTo('main.index');
  }

  model() {
    return this.appState.lastError;
  }
}

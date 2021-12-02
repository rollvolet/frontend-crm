import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';

export default class OopsRoute extends Route {
  @service appState;
  @service session;

  beforeModel() {
    if (!this.appState.lastError) {
      this.transitionTo('main.index');
    } else if (this.appState.lastError.status == 401) {
      warn(
        'XHR request returned 401 Unauthorized. Log out to get in a consistent authentication state',
        { id: 'xhr.failure' }
      );
      this.session.invalidate();
    }
  }

  model() {
    return this.appState.lastError;
  }
}

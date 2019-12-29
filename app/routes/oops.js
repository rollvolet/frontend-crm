import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

@classic
export default class OopsRoute extends Route {
  @service
  appState;

  beforeModel() {
    if (!this.appState.lastError)
      this.transitionTo('main.index');
  }

  model() {
    return this.appState.lastError;
  }
}

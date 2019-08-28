import Controller from '@ember/controller';
import Ember from 'ember';
import { inject as service } from '@ember/service';
import { debug } from '@ember/debug';

export default Controller.extend({
  appState: service(),

  init() {
    this._super(...arguments);
    Ember.onerror = (error) => {
      this.handleApplicationError(error);
    };
  },

  handleApplicationError(error) {
    const shouldBeIgnored = function(error) {
      return error.isAdapterError
        && error.errors.length
        && Math.floor(error.errors[0].status / 100) == 4;
    };

    if (shouldBeIgnored(error)) {
      debug(`An error occurred, but error reporting is disabled for this error: ${error}`);
    } else {
      this.appState.reportError(error);
      this.transitionToRoute('oops');
    }
  }
});

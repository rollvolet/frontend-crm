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
    if (error.isAdapterError) {
      debug(`Adapter error reporting is disabled`);
    } else {
      this.appState.reportError(error);
      this.transitionToRoute('oops');
    }
  }
});

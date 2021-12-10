import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import Ember from 'ember';
import { debug } from '@ember/debug';

export default class ApplicationController extends Controller {
  @service appState;

  init() {
    super.init(...arguments);
    Ember.onerror = (error) => {
       this.handleApplicationError(error);
    };
  }

  handleApplicationError(error) {
    const shouldBeIgnored = function (error) {
      return (
        error.isInternalError ||
        (error.isAdapterError &&
          error.errors.length &&
          Math.floor(error.errors[0].status / 100) == 4)
      );
    };

    if (shouldBeIgnored(error)) {
      debug(`An error occurred, but error reporting is disabled for this error: ${error}`);
    } else {
      this.appState.reportError(error);
      this.transitionToRoute('oops');
    }
  }
}

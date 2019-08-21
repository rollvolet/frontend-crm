import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { task } from 'ember-concurrency';

export default Controller.extend({
  session: inject(),

  login: task(function * () {
    yield this.session.authenticate('authenticator:torii', 'azure-ad2-oauth2').catch((reason) => {
      this.set('errorMessage', reason.error || reason);
    });
  }).restartable(),

  actions: {
    logout() {
      this.session.invalidate();
    },
    resetError() {
      this.set('errorMessage', null);
    }
  }
});

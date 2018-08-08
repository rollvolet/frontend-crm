import { inject } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  session: inject(),
  actions: {
    login() {
      this.session.authenticate('authenticator:torii', 'azure-ad2-oauth2').catch((reason) => {
        this.set('errorMessage', reason.error || reason);
      });
    },
    logout() {
      this.session.invalidate();
    },
    resetError() {
      this.set('errorMessage', null);
    }
  }
});

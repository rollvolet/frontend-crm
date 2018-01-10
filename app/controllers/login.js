import { inject } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  session: inject(),
  actions: {
    login() {
      this.get('session').authenticate('authenticator:torii', 'azure-oauth2').catch((reason) => {
        this.set('errorMessage', reason.error || reason);
      });
    },
    logout() {
      this.get('session').invalidate();
    },
    resetError() {
      this.set('errorMessage', null);
    }
  }
});

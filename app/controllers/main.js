import { inject } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  session: inject(),
  actions: {
    openMail() {
      window.location.href = 'mailto:support@moof-it.be';
    },
    logout() {
      this.session.invalidate();
    },
    goToProfile() {
      window.alert("User profile not implemented yet");
    }
  }
});

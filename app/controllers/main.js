import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  configuration: service(),
  session: service(),
  actions: {
    openMail() {
      window.location.href = 'mailto:erika.pauwels@redpencil.io';
    },
    logout() {
      this.session.invalidate();
    },
    goToProfile() {
      window.alert("User profile not implemented yet");
    }
  }
});

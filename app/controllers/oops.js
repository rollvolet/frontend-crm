import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  appState: service(),

  actions: {
    goBack() {
      const url = this.appState.lastSuccessUrl;

      if (url) {
        window.location = url;
      } else {
        window.location = '/';
      }
    }
  }
});

import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  router: service(),

  lastError: null,
  lastSuccessUrl: null,

  reportError(error) {
    this.set('lastError', error);
    this.set('lastSuccessUrl', this.router.currentURL);
    // TODO send error to backend
  }
});

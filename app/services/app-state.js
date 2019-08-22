import Service from '@ember/service';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import config from '../config/environment';

export default Service.extend({
  router: service(),

  lastError: null,
  lastSuccessUrl: null,

  reportError(error) {
    this.set('lastError', error);
    this.set('lastSuccessUrl', this.router.currentURL);

    fetch('/api/error-notifications', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          attributes: {
            version: config.APP.version,
            file: error.fileName,
            lineNumber: error.lineNumber,
            columnNumber: error.columnNumber,
            currentUrl: this.lastSuccessUrl,
            type: error.name,
            message: error.message,
            stack: error.stack
          }
        }
      })
    });
  }
});

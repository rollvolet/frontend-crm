import classic from 'ember-classic-decorator';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import config from '../config/environment';

@classic
export default class AppStateService extends Service {
  @service
  router;

  @service
  session;

  lastError = null;
  lastSuccessUrl = null;

  reportError(error) {
    this.set('lastError', error);
    this.set('lastSuccessUrl', this.router.currentURL);

    const { access_token } = this.session.data.authenticated;
    fetch('/api/error-notifications', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          type: 'error-notifications',
          attributes: {
            version: config.APP.version,
            file: error.fileName,
            'line-number': error.lineNumber,
            'column-number': error.columnNumber,
            'current-url': window.location.toString(),
            'current-path': this.lastSuccessUrl,
            type: error.name,
            message: error.message,
            stack: error.stack
          }
        }
      })
    });
  }
}

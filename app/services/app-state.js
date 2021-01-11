import Service from '@ember/service';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import config from '../config/environment';
import { tracked } from '@glimmer/tracking';

export default class AppStateService extends Service {
  @service router

  @tracked lastError = null;
  @tracked lastSuccessUrl = null;

  reportError(error) {
    this.lastError = error;
    this.lastSuccessUrl = this.router.currentURL;

    fetch('/api/error-notifications', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
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
            type: error.name || 'XHR',
            message: error.message || `[${error.status}] ${error.statusText}`,
            stack: error.stack || error.url
          }
        }
      })
    });
  }
}

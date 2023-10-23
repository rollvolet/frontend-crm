import fetch from 'fetch';
import config from 'rollvolet-crm/config/environment';

export default function reportError(error, source) {
  return fetch('/error-notifications', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'error-notifications',
        attributes: {
          date: new Date().toISOString(),
          version: config.APP.version,
          'current-url': window.location.toString(),
          'current-path': source,
          type: error.name || 'XHR',
          message: error.message || `[${error.status}] ${error.statusText}`,
          stack: error.stack || error.url,
          file: error.fileName,
          'line-number': error.lineNumber,
          'column-number': error.columnNumber,
        },
      },
    }),
  });
}

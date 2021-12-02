import JSONAPIAdapter from '@ember-data/adapter/json-api';

export default class ApplicationAdapter extends JSONAPIAdapter {
  namespace = 'api';

  handleResponse(status, headers, payload /*, requestData*/) {
    if (!this.isSuccess(status, headers, payload)) {
      const { code, title, detail } = payload ? payload : {};
      payload = {
        errors: [
          {
            status: `${status}`,
            code: `${code}`,
            title: `${title}`,
            detail: `${detail}`,
          },
        ],
      };
    }

    return super.handleResponse(...arguments);
  }
}

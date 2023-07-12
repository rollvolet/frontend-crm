import JSONAPIAdapter from '@ember-data/adapter/json-api';
import classic from 'ember-classic-decorator';

@classic
export default class ApplicationAdapter extends JSONAPIAdapter {
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

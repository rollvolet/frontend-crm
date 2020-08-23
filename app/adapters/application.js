import { inject as service } from '@ember/service';
import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, {
  namespace: 'api',
  session: service(),

  handleResponse(status, headers, payload/*, requestData*/) {
    if (!this.isSuccess(status, headers, payload)) {
      const { code, title, detail } = payload ? payload : {};
      payload = {
        errors: [
          {
            status: `${status}`,
            code: `${code}`,
            title: `${title}`,
            detail: `${detail}`
          },
        ]
      };
    }

    return this._super(...arguments);
  }
});

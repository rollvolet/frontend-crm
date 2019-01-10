import { inject as service } from '@ember/service';
import DS from 'ember-data';
import HasManyQuery from 'ember-data-has-many-query';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DS.JSONAPIAdapter.extend(HasManyQuery.RESTAdapterMixin, DataAdapterMixin, {
  namespace: 'api',
  session: service(),
  authorize(xhr) {
    const { access_token } = this.get('session.data.authenticated');
    xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
  },


  handleResponse(status, headers, payload, requestData) {
    if (!this.isSuccess(status, headers, payload)) {
      payload = {
        errors: [
          {
            status: `${status}`,
            code: `${payload.code}`,
            title: `${payload.title}`,
            detail: `${payload.detail}`
          },
        ]
      };
    }

    return this._super(...arguments);
  }

});

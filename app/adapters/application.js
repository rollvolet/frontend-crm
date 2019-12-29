import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import DS from 'ember-data';
import HasManyQuery from 'ember-data-has-many-query';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DS.JSONAPIAdapter.extend(HasManyQuery.RESTAdapterMixin, DataAdapterMixin, {
  namespace: 'api',
  session: service(),

  headers: computed('session.data.authenticated.access_token', function() {
    const headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
    }
    return headers;
  }),

  handleResponse(status, headers, payload/*, requestData*/) {
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

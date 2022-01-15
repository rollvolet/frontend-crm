import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EditRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('request', params.request_id, {
      // We must include customer such that it is also included in PATCH requests to /request/:id.
      // Otherwise the customer will be unlinked from the request after a PATCH request
      include: 'customer',
    });
  }
}

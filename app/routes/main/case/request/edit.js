import Route from '@ember/routing/route';

export default class EditRoute extends Route {
  model(params) {
    return this.store.loadRecord('request', params.request_id, {
      // We must include customer such that it is also included in PATCH requests to /request/:id.
      // Otherwise the customer will be unlinked from the request after a PATCH request
      include: 'customer'
    });
  }
}

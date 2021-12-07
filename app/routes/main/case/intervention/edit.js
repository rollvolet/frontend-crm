import Route from '@ember/routing/route';

export default class EditRoute extends Route {
  model(params) {
    return this.store.findRecord('intervention', params.intervention_id, {
      // We must include customer such that it is also included in PATCH requests to /intervention/:id.
      // Otherwise the customer will be unlinked from the intervention after a PATCH request
      include: 'customer',
    });
  }
}

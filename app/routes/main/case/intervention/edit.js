import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EditRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('intervention', params.intervention_id, {
      // We must include customer such that it is also included in PATCH requests to /intervention/:id.
      // Otherwise the customer will be unlinked from the intervention after a PATCH request
      include: 'customer',
    });
  }
}

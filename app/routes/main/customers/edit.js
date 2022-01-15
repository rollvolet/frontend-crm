import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EditRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('customer', params.customer_id, {
      // don't include telephones here. Telephones need to be retrieved in a separate request
      // so we can include the telephone types in them
      include: 'honorific-prefix',
    });
  }
}

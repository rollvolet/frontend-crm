import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EditRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('order', params.order_id, {
      include: 'vat-rate',
    });
  }
}

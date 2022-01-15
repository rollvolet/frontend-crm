import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EditRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('invoice', params.invoice_id, {
      include: 'vat-rate',
    });
  }
}

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MainCaseOrderEditRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('order', params.order_id, {
      include: 'planning,case.offer,case.invoice',
    });
  }
}

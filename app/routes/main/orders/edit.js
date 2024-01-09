import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MainOrdersEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    this.orderId = params.order_id;
    return this.store.queryOne('case', {
      'filter[order][:id:]': params.order_id,
    });
  }

  afterModel(model) {
    this.router.transitionTo('main.case.order.edit.index', model.id, this.orderId);
  }
}

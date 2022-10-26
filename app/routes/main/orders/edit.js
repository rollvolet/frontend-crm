import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainOrdersEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('order', params.order_id);
  }

  async afterModel(model) {
    // TODO get related case via order model once relation is fully defined
    const _case = await this.store.queryOne('case', {
      'filter[:exact:order]': model.uri,
    });
    this.router.transitionTo('main.case.order.edit.index', _case.id, model.id);
  }
}

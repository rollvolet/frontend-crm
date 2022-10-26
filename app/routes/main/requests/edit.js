import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainRequestsEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('request', params.request_id);
  }

  async afterModel(model) {
    // TODO get related case via request model once relation is fully defined
    const _case = await this.store.queryOne('case', {
      'filter[:exact:request]': model.uri,
    });
    this.router.transitionTo('main.case.request.edit.index', _case.id, model.id);
  }
}

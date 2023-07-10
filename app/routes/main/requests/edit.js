import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainRequestsEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    this.requestId = params.request_id;
    return this.store.queryOne('case', {
      'filter[request][:id:]': params.request_id,
    });
  }

  afterModel(model) {
    this.router.transitionTo('main.case.request.edit.index', model.id, this.requestId);
  }
}

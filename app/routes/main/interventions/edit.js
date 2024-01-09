import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MainInterventionsEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    this.interventionId = params.intervention_id;
    return this.store.queryOne('case', {
      'filter[intervention][:id:]': params.intervention_id,
    });
  }

  afterModel(model) {
    this.router.transitionTo('main.case.intervention.edit.index', model.id, this.interventionId);
  }
}

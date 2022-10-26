import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainInterventionsEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('intervention', params.intervention_id, {
      include: 'customer',
    });
  }

  async afterModel(model) {
    // TODO get related case via intervention model once relation is fully defined
    const _case = await this.store.queryOne('case', {
      'filter[:exact:intervention]': model.uri,
    });
    this.router.transitionTo('main.case.intervention.edit.index', _case.id, model.id);
  }
}

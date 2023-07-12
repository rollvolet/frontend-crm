import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainCaseInterventionEditRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('intervention', params.intervention_id, {
      include: 'visit,case.invoice',
    });
  }
}

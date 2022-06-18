import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainInterventionsNewRoute extends Route {
  @service userInfo;
  @service store;
  @service router;

  model() {
    const employee = this.userInfo.employee;
    const intervention = this.store.createRecord('intervention', {
      date: new Date(),
      employee,
    });

    return intervention.save();
  }

  afterModel(model) {
    this.router.transitionTo('main.interventions.edit', model);
  }
}

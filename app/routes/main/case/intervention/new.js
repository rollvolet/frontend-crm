import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  @service userInfo;
  @service store;
  @service router;

  model() {
    const customer = this.modelFor('main.case');
    const employee = this.userInfo.employee;
    const intervention = this.store.createRecord('intervention', {
      date: new Date(),
      customer,
      employee,
    });

    return intervention.save();
  }

  afterModel(model) {
    const customer = this.modelFor('main.case');
    this.router.transitionTo('main.case.intervention.edit', customer, model);
  }
}

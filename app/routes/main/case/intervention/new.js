import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  @service userInfo;

  async model() {
    const customer = this.modelFor('main.case');
    const employee = await this.userInfo.getEmployee();
    const intervention = this.store.createRecord('intervention', {
      date: new Date(),
      customer,
      employee,
    });

    return intervention.save();
  }

  afterModel(model) {
    const customer = this.modelFor('main.case');
    this.transitionTo('main.case.intervention.edit', customer, model);
  }
}

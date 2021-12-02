import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainInterventionsNewRoute extends Route {
  @service userInfo;

  async model() {
    const employee = await this.userInfo.getEmployee();
    const intervention = this.store.createRecord('intervention', {
      date: new Date(),
      employee,
    });

    return intervention.save();
  }

  afterModel(model) {
    this.transitionTo('main.interventions.edit', model, {
      queryParams: { editMode: true },
    });
  }
}

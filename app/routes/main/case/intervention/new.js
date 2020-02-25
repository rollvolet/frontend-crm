import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  @service currentSession

  model() {
    const customer = this.modelFor('main.case');
    const intervention = this.store.createRecord('intervention', {
      date: new Date(),
      customer: customer
    });

    return intervention.save();
  }

  afterModel(model) {
    const customer = this.modelFor('main.case');
    this.transitionTo('main.case.intervention.edit', customer, model, {
      queryParams: { editMode: true }
    });
  }
}

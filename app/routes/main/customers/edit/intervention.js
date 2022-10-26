import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainCustomersEditInterventionRoute extends Route {
  @service userInfo;
  @service store;
  @service router;

  async model() {
    const customer = this.modelFor('main.customers.edit');
    const employee = this.userInfo.employee;
    const intervention = this.store.createRecord('intervention', {
      date: new Date(),
      employee,
      customer,
    });

    await intervention.save();

    // TODO first create case and relate to intervention once relationship is fully defined
    const _case = this.store.createRecord('case', {
      customer: customer.uri,
      intervention: intervention.uri,
    });

    await _case.save();

    return { case: _case, intervention };
  }

  afterModel(model) {
    this.router.transitionTo(
      'main.case.intervention.edit.index',
      model.case.id,
      model.intervention.id
    );
  }
}
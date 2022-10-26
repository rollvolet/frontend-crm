import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainCustomersEditRequestRoute extends Route {
  @service userInfo;
  @service store;
  @service router;

  async model() {
    const customer = this.modelFor('main.customers.edit');
    const employee = this.userInfo.employee;
    const firstName = employee ? employee.firstName : null;
    const wayOfEntry = this.store.peekAll('way-of-entry').find((e) => e.position == '1');
    const request = this.store.createRecord('request', {
      requestDate: new Date(),
      requiresVisit: false,
      employee: firstName,
      wayOfEntry,
      customer,
    });

    await request.save();

    // TODO first create case and relate to request once relationship is fully defined
    const _case = this.store.createRecord('case', {
      customer: customer.uri,
      request: request.uri,
    });

    await _case.save();

    return { case: _case, request };
  }

  afterModel(model) {
    this.router.transitionTo('main.case.request.edit.index', model.case.id, model.request.id);
  }
}

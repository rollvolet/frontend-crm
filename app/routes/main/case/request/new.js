import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  @service userInfo;
  @service store;
  @service router;

  model() {
    const customer = this.modelFor('main.case');
    const employee = this.userInfo.employee;
    const firstName = employee ? employee.firstName : null;
    const wayOfEntry = this.store.peekAll('way-of-entry').find((e) => e.position == '1');
    const request = this.store.createRecord('request', {
      requestDate: new Date(),
      requiresVisit: false,
      customer: customer,
      employee: firstName,
      wayOfEntry,
    });

    return request.save();
  }

  afterModel(model) {
    const customer = this.modelFor('main.case');
    this.router.transitionTo('main.case.request.edit', customer, model);
  }
}

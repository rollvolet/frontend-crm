import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  @service userInfo;

  async model() {
    const customer = this.modelFor('main.case');
    const employee = await this.userInfo.getEmployee();
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
    this.transitionTo('main.case.request.edit', customer, model);
  }
}

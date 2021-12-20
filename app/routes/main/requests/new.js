import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  @service userInfo;

  async model() {
    const employee = await this.userInfo.getEmployee();
    const firstName = employee ? employee.firstName : null;
    const request = this.store.createRecord('request', {
      requestDate: new Date(),
      requiresVisit: false,
      employee: firstName,
    });

    return request.save();
  }

  afterModel(model) {
    this.transitionTo('main.requests.edit', model);
  }
}

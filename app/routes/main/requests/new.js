import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  @service userInfo;
  @service store;
  @service router;

  model() {
    const employee = this.userInfo.employee;
    const firstName = employee ? employee.firstName : null;
    const request = this.store.createRecord('request', {
      requestDate: new Date(),
      requiresVisit: false,
      employee: firstName,
    });

    return request.save();
  }

  afterModel(model) {
    this.router.transitionTo('main.requests.edit', model);
  }
}

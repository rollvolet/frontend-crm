import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainRequestsNewRoute extends Route {
  @service userInfo;
  @service store;
  @service router;

  async model() {
    const employee = this.userInfo.employee;
    const firstName = employee ? employee.firstName : null;
    const wayOfEntry = this.store.peekAll('way-of-entry').find((e) => e.position == '1');
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 21);
    const request = this.store.createRecord('request', {
      requestDate: new Date(),
      employee: firstName,
      wayOfEntry,
    });

    await request.save();

    // TODO first create case and relate to request once relationship is fully defined
    const _case = this.store.createRecord('case', {
      identifier: `AD-${request.id}`,
      request: request.uri,
      vatRate,
    });

    await _case.save();

    return { case: _case, request };
  }

  afterModel(model) {
    this.router.transitionTo('main.case.request.edit.index', model.case.id, model.request.id);
  }
}

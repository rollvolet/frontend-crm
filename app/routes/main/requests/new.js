import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainRequestsNewRoute extends Route {
  @service configuration;
  @service userInfo;
  @service sequence;
  @service store;
  @service router;

  async model() {
    const employee = this.userInfo.employee;
    const wayOfEntry = this.configration.defaultWayOfEntry;
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 21);
    const number = await this.sequence.fetchNextCaseNumber();

    const request = this.store.createRecord('request', {
      requestDate: new Date(),
      number,
      employee,
      wayOfEntry,
    });

    await request.save();

    const _case = this.store.createRecord('case', {
      identifier: `AD-${number}`,
      request,
      vatRate,
    });

    await _case.save();

    return { case: _case, request };
  }

  afterModel(model) {
    this.router.transitionTo('main.case.request.edit.index', model.case.id, model.request.id);
  }
}

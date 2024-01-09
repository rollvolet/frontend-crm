import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { createCase } from '../../../utils/case-helpers';

export default class MainRequestsNewRoute extends Route {
  @service codelist;
  @service userInfo;
  @service sequence;
  @service store;
  @service router;

  async model() {
    const employee = this.userInfo.employee;
    const wayOfEntry = this.codelist.defaultWayOfEntry;
    const deliveryMethod = this.codelist.defaultDeliveryMethod;
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 21);
    const number = await this.sequence.fetchNextRequestNumber();

    const request = this.store.createRecord('request', {
      requestDate: new Date(),
      number,
      employee,
      wayOfEntry,
    });

    await request.save();

    const _case = await createCase({
      request,
      vatRate,
      deliveryMethod,
    });

    return { case: _case, request };
  }

  afterModel(model) {
    this.router.transitionTo('main.case.request.edit.index', model.case.id, model.request.id);
  }
}

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { createCase } from '../../../../utils/case-helpers';

export default class MainCustomersEditInterventionRoute extends Route {
  @service userInfo;
  @service sequence;
  @service store;
  @service router;

  async model() {
    const customer = this.modelFor('main.customers.edit');
    const employee = this.userInfo.employee;
    const number = await this.sequence.fetchNextInterventionNumber();

    const intervention = this.store.createRecord('intervention', {
      interventionDate: new Date(),
      number,
      employee,
    });

    await intervention.save();

    const _case = await createCase({
      identifier: `IR-${number}`,
      customer,
      intervention,
    });

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

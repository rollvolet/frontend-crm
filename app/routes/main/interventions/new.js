import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainInterventionsNewRoute extends Route {
  @service userInfo;
  @service sequence;
  @service store;
  @service router;

  async model() {
    const employee = this.userInfo.employee;
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 6);
    const number = await this.sequence.fetchNextCaseNumber();

    const intervention = this.store.createRecord('intervention', {
      interventionDate: new Date(),
      number,
      employee,
    });

    await intervention.save();

    const _case = this.store.createRecord('case', {
      identifier: `IR-${number}`,
      intervention,
      vatRate,
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

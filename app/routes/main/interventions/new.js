import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainInterventionsNewRoute extends Route {
  @service userInfo;
  @service store;
  @service router;

  async model() {
    const employee = this.userInfo.employee;
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 6);

    const intervention = this.store.createRecord('intervention', {
      date: new Date(),
      employee,
    });

    await intervention.save();

    // TODO first create case and relate to intervention once relationship is fully defined
    const _case = this.store.createRecord('case', {
      identifier: `IR-${intervention.id}`,
      intervention: intervention.uri,
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

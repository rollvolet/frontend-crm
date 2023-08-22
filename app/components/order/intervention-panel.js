import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class OrderInterventionPanelComponent extends Component {
  @service userInfo;
  @service sequence;
  @service store;
  @service router;

  @task
  *createNew() {
    const _case = yield this.args.order.case;
    const employee = this.userInfo.employee;
    const [customer, contact, building, vatRate, number] = yield Promise.all([
      _case.customer,
      _case.contact,
      _case.building,
      _case.vatRate,
      yield this.sequence.fetchNextCaseNumber(),
    ]);

    const intervention = this.store.createRecord('intervention', {
      interventionDate: new Date(),
      number,
      origin: this.args.order,
      employee,
    });

    yield intervention.save();

    const newCase = this.store.createRecord('case', {
      identifier: `IR-${number}`,
      customer,
      contact,
      building,
      vatRate,
      intervention,
    });

    yield newCase.save();

    this.router.transitionTo('main.case.intervention.edit.index', newCase.id, intervention.id, {
      queryParams: { editMode: true },
    });
  }
}

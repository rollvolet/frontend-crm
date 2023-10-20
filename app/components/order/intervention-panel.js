import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { createCase } from '../../utils/case-helpers';

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
      this.sequence.fetchNextInterventionNumber(),
    ]);

    const intervention = this.store.createRecord('intervention', {
      interventionDate: new Date(),
      number,
      origin: this.args.order,
      employee,
    });

    yield intervention.save();

    const newCase = yield createCase({
      customer,
      contact,
      building,
      vatRate,
      intervention,
    });

    this.router.transitionTo('main.case.intervention.edit.index', newCase.id, intervention.id, {
      queryParams: { editMode: true },
    });
  }
}

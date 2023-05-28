import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import updateContactAndBuildingRequest from '../../utils/api/update-contact-and-building';
import { task } from 'ember-concurrency';

export default class OrderInterventionPanelComponent extends Component {
  @service case;
  @service userInfo;
  @service store;
  @service router;

  @task
  *createNew() {
    const customer = this.case.current.customer;
    const employee = this.userInfo.employee;
    const vatRate = yield this.case.current.case.vatRate;
    const intervention = this.store.createRecord('intervention', {
      date: new Date(),
      origin: this.args.order,
      customer,
      employee,
    });

    yield intervention.save();

    // TODO first create case and relate to intervention once relationship is fully defined
    const _case = this.store.createRecord('case', {
      identifier: `IR-${intervention.id}`,
      customer: customer?.uri,
      intervention: intervention.uri,
      vatRate,
    });

    yield _case.save();

    // TODO remove once cases are fully moved to triplestore
    const body = {
      contactId: this.case.current.contact && this.case.current.contact.id,
      buildingId: this.case.current.building && this.case.current.building.id,
      interventionId: intervention.id,
    };
    yield updateContactAndBuildingRequest(body);

    this.router.transitionTo('main.case.intervention.edit.index', _case.id, intervention.id, {
      queryParams: { editMode: true },
    });
  }
}

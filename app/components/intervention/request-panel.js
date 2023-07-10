import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import updateContactAndBuildingRequest from '../../utils/api/update-contact-and-building';
import { keepLatestTask, task } from 'ember-concurrency';

export default class InterventionRequestPanelComponent extends Component {
  @service case;
  @service router;
  @service store;

  @tracked request;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    this.request = yield this.args.model.followUpRequest;
  }

  @task
  *createFollowUpRequest() {
    const customer = this.case.current.customer;
    const contact = this.case.current.contact;
    const building = this.case.current.building;
    const employee = yield this.args.model.employee;
    const firstName = employee ? employee.firstName : null;
    const wayOfEntry = this.store.peekAll('way-of-entry').find((e) => e.position == '1');
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 21);

    const request = this.store.createRecord('request', {
      requestDate: new Date(),
      employee: firstName,
      origin: this.args.model,
      customer,
      wayOfEntry,
    });
    yield request.save();

    // TODO first create case and relate to request once relationship is fully defined
    const _case = this.store.createRecord('case', {
      identifier: `AD-${request.id}`,
      customer: customer?.uri,
      contact: contact?.uri,
      building: building?.uri,
      request: request.uri,
      vatRate,
    });

    yield _case.save();

    const body = {
      contactId: contact?.id,
      buildingId: building?.id,
      requestId: request.id,
    };
    yield updateContactAndBuildingRequest(body);

    this.args.model.cancellationDate = new Date();
    this.args.model.cancellationReason = 'Nieuwe aanvraag gestart';
    yield this.args.model.save();

    this.router.transitionTo('main.case.request.edit.index', _case.id, request.id, {
      queryParams: { editMode: true },
    });
  }
}

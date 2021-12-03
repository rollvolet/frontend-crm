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
    const request = this.store.createRecord('request', {
      requestDate: new Date(),
      requiresVisit: false,
      employee: firstName,
      origin: this.args.model,
      customer,
    });
    yield request.save();

    const body = {
      contactId: contact && contact.id,
      buildingId: building && building.id,
      requestId: request.id,
    };
    yield updateContactAndBuildingRequest(body);

    this.router.transitionTo('main.requests.edit', request.id, {
      queryParams: { editMode: true },
    });
  }
}

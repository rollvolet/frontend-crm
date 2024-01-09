import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import { createCase, cancelCase } from '../../utils/case-helpers';

export default class InterventionRequestPanelComponent extends Component {
  @service router;
  @service store;
  @service userInfo;
  @service codelist;
  @service sequence;

  requestData = trackedFunction(this, async () => {
    return await this.args.model.followUpRequest;
  });

  get request() {
    return this.requestData.value;
  }

  @task
  *createFollowUpRequest() {
    const _case = yield this.args.model.case;

    const [customer, contact, building, employee, number] = yield Promise.all([
      _case.customer,
      _case.contact,
      _case.building,
      this.args.model.employee,
      this.sequence.fetchNextRequestNumber(),
    ]);
    const wayOfEntry = this.codelist.defaultWayOfEntry;
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 21);

    const request = this.store.createRecord('request', {
      number,
      requestDate: new Date(),
      employee,
      origin: this.args.model,
      wayOfEntry,
    });
    yield request.save();

    const newCase = yield createCase({
      customer,
      contact,
      building,
      vatRate,
      request,
    });

    yield cancelCase(_case, 'Nieuwe aanvraag gestart', this.userInfo.user);

    this.router.transitionTo('main.case.request.edit.index', newCase.id, request.id, {
      queryParams: { editMode: true },
    });
  }
}

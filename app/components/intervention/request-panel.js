import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { createCase, cancelCase } from '../../utils/case-helpers';

export default class InterventionRequestPanelComponent extends Component {
  @service router;
  @service store;
  @service userInfo;
  @service codelist;
  @service sequence;

  @cached
  get request() {
    return new TrackedAsyncData(this.args.model.followUpRequest);
  }

  get hasRequest() {
    return this.request.isResolved && this.request.value != null;
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
      request,
    });

    yield cancelCase(_case, 'Nieuwe aanvraag gestart', this.userInfo.user);

    this.router.transitionTo('main.case.request.edit.index', newCase.id, request.id, {
      queryParams: { editMode: true },
    });
  }
}

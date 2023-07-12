import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import { cancelCase } from '../../utils/case-helpers';
import constants from '../../config/constants';

const { WAY_OF_ENTRIES } = constants;

export default class InterventionRequestPanelComponent extends Component {
  @service router;
  @service store;
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

    const [customer, contact, building, employee] = yield Promise.all([
      _case.customer,
      _case.contact,
      _case.building,
      this.args.model.employee,
    ]);
    const wayOfEntry = this.store.peekAll('concept').find((c) => c.uri == WAY_OF_ENTRIES.TELEPHONE);
    const vatRate = this.store.peekAll('vat-rate').find((v) => v.rate == 21);

    const number = yield this.sequence.fetchNextCaseNumber();
    const newCase = this.store.createRecord('case', {
      identifier: `AD-${number}`,
      customer,
      contact,
      building,
      vatRate,
    });
    yield newCase.save();

    const request = this.store.createRecord('request', {
      number,
      requestDate: new Date(),
      case: newCase,
      employee,
      origin: this.args.model,
      wayOfEntry,
    });
    yield request.save();

    yield cancelCase(_case, 'Nieuwe aanvraag gestart');

    this.router.transitionTo('main.case.request.edit.index', newCase.id, request.id, {
      queryParams: { editMode: true },
    });
  }
}

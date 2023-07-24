import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask, task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import { setCalendarEventProperties } from '../../utils/calendar-helpers';

export default class OfferDetailPanelComponent extends Component {
  @service store;

  @tracked editMode = false;

  constructor() {
    super(...arguments);
    this.editMode = this.args.initialEditMode || false;
  }

  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  get case() {
    return this.caseData.value;
  }

  requestData = trackedFunction(this, async () => {
    return await this.case?.request;
  });

  get request() {
    return this.requestData.value;
  }

  @task
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid) {
      yield this.args.model.save();
    }
  }

  @keepLatestTask
  *synchronizeCalendarEvent() {
    const visit = yield this.request?.visit;
    if (visit) {
      yield setCalendarEventProperties(visit, {
        request: this.request,
      });
      yield visit.save();
    }
  }

  @task
  *setVisitor(visitor) {
    this.request.visitor = visitor;
    yield this.request.save();
    yield this.synchronizeCalendarEvent.perform();
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
  }
}

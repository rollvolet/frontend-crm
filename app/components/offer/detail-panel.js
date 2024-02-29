import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked, cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import { keepLatestTask, task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import { updateCalendarEvent } from '../../utils/calendar-helpers';

export default class OfferDetailPanelComponent extends Component {
  @service store;

  @tracked editMode = false;

  constructor() {
    super(...arguments);
    this.editMode = this.args.initialEditMode || false;
  }

  @cached
  get case() {
    return new TrackedAsyncData(this.args.model.case);
  }

  @cached
  get request() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.request);
    } else {
      return null;
    }
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
    const request = this.request.isResolved && this.request.value;
    yield updateCalendarEvent({ request });
  }

  @task
  *setVisitor(visitor) {
    const request = this.request.isResolved && this.request.value;
    request.visitor = visitor;
    yield request.save();
    const order = yield this.case.order;
    yield updateCalendarEvent({ request, order });
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

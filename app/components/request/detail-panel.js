import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked, cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import isSameDay from 'date-fns/isSameDay';
import { task, keepLatestTask } from 'ember-concurrency';
import generateDocument from '../../utils/generate-document';

export default class RequestDetailPanelComponent extends Component {
  @service store;

  @tracked editMode = false;

  @cached
  get case() {
    return new TrackedAsyncData(this.args.model.case);
  }

  @cached
  get customer() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.customer);
    } else {
      return null;
    }
  }

  @cached
  get offer() {
    if (this.case.isResolved) {
      return new TrackedAsyncData(this.case.value.offer);
    } else {
      return null;
    }
  }

  get isLinkedToCustomer() {
    return this.customer?.isResolved && this.customer.value != null;
  }

  get hasOffer() {
    return this.offer?.isResolved && this.offer.value != null;
  }

  get isLimitedEdit() {
    return this.hasOffer;
  }

  @keepLatestTask
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid) {
      yield this.args.model.save();
    }
  }

  @task
  *setRequiresVisit(event) {
    const value = event.target.checked;

    if (value) {
      this.args.model.indicativeVisitDate = new Date();
      this.args.model.indicativeVisitPeriod = 'GD';
    } else {
      this.args.model.indicativeVisitDate = null;
      this.args.model.indicativeVisitPeriod = null;
      const timeSlot = yield this.args.model.timeSlot;
      if (timeSlot) {
        yield timeSlot.destroyRecord();
      }
    }

    yield this.save.perform();
  }

  @task
  *updateVisit(date, period) {
    const dateHasChanged = !isSameDay(this.args.model.indicativeVisitDate, date);

    this.args.model.indicativeVisitDate = date;
    this.args.model.indicativeVisitPeriod = period;
    yield this.save.perform();

    if (dateHasChanged) {
      // needs to be rescheduled on another day
      const timeSlot = yield this.args.model.timeSlot;
      if (timeSlot) {
        yield timeSlot.destroyRecord();
      }
    }
  }

  @action
  generateVisitReport() {
    generateDocument(`/requests/${this.args.model.id}/documents`, {
      record: this.args.model,
    });
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

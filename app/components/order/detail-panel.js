import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked, cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import { keepLatestTask, task } from 'ember-concurrency';
import { setCalendarEventProperties, updateCalendarEvent } from '../../utils/calendar-helpers';
import CalendarPeriod from '../../classes/calendar-period';

export default class OrderDetailPanelComponent extends Component {
  @service store;

  @tracked editMode = false;
  @tracked isOpenCancellationModal = false;

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

  get isNbOfPersonsWarning() {
    return this.args.model.scheduledNbOfPersons != 2;
  }

  @task
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid) {
      yield this.synchronizeCalendarEvent.perform();
      yield this.args.model.save();
    }
  }

  @keepLatestTask
  *updateCalendarPeriod(calendarPeriod) {
    const planning = yield this.args.model.planning;
    if (planning) {
      yield setCalendarEventProperties(planning, {
        order: this.args.model,
        calendarPeriod,
      });
      if (planning.hasDirtyAttributes) {
        yield this.saveCalendarEvent.perform(planning);
      }
    }
  }

  @keepLatestTask
  *forceCalendarEventSynchronization() {
    yield this.synchronizeCalendarEvent.perform({ force: true });
  }

  @keepLatestTask
  *synchronizeCalendarEvent({ force = false } = {}) {
    const planning = yield this.args.model.planning;
    if (planning) {
      yield setCalendarEventProperties(planning, {
        order: this.args.model,
      });
      const mustUpdate = force || planning.hasDirtyAttributes;
      if (!planning.isNew && mustUpdate) {
        // only save if it has already been saved before (by selecting a date/period)
        yield this.saveCalendarEvent.perform(planning);
      }
    }
  }

  @keepLatestTask
  *saveCalendarEvent(calendarEvent) {
    const { validations } = yield calendarEvent.validate();
    if (validations.isValid) {
      yield calendarEvent.save();
    }
  }

  async ensureCalendarEvent() {
    let planning = await this.args.model.planning;
    if (!planning) {
      planning = this.store.createRecord('calendar-event', {
        order: this.args.model,
        date: null, // ember-flatpickr cannot handle 'undefined'
      });
      await setCalendarEventProperties(planning, {
        order: this.args.model,
        calendarPeriod: new CalendarPeriod('GD'),
      });
      // don't save calendar-event yet. It's just a placeholder to fill in the form.
    }
  }

  @keepLatestTask
  *deleteCalendarEvent() {
    const planning = yield this.args.model.planning;
    if (planning) {
      yield planning.destroyRecord();
    }
    yield this.ensureCalendarEvent();
  }

  @task
  *setVisitor(visitor) {
    if (this.request.isResolved) {
      const request = this.request.value;
      request.visitor = visitor;
      yield request.save();
      yield updateCalendarEvent({ request: request });
    }
  }

  @action
  async openEdit() {
    await this.ensureCalendarEvent();
    this.editMode = true;
  }

  @action
  async closeEdit() {
    this.editMode = false;
    const planning = await this.args.model.planning;
    if (planning && planning.isNew) {
      await planning.destroyRecord();
    }
  }
}

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { setCalendarEventProperties } from '../../utils/calendar-helpers';
import generateDocument from '../../utils/generate-document';
import CalendarPeriod from '../../classes/calendar-period';

export default class InterventionDetailPanelComponent extends Component {
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

  get isNbOfPersonsWarning() {
    return this.args.model.scheduledNbOfPersons != 2;
  }

  get isLinkedToCustomer() {
    return this.customer?.isResolved && this.customer.value != null;
  }

  @keepLatestTask
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid) {
      yield this.synchronizeCalendarEvent.perform();
      yield this.args.model.save();
    }
  }

  @keepLatestTask
  *updateCalendarPeriod(calendarPeriod) {
    const visit = yield this.args.model.visit;
    if (visit) {
      yield setCalendarEventProperties(visit, {
        intervention: this.args.model,
        calendarPeriod,
      });
      if (visit.hasDirtyAttributes) {
        yield this.saveCalendarEvent.perform(visit);
      }
    }
  }

  @keepLatestTask
  *forceCalendarEventSynchronization() {
    yield this.synchronizeCalendarEvent.perform({ force: true });
  }

  @keepLatestTask
  *synchronizeCalendarEvent({ force = false } = {}) {
    const visit = yield this.args.model.visit;
    if (visit) {
      yield setCalendarEventProperties(visit, {
        intervention: this.args.model,
      });
      const mustUpdate = force || visit.hasDirtyAttributes;
      if (!visit.isNew && mustUpdate) {
        // only save if it has already been saved before (by selecting a date/period)
        yield this.saveCalendarEvent.perform(visit);
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
    const visit = await this.args.model.visit;
    if (this.isLinkedToCustomer && !visit) {
      const visit = this.store.createRecord('calendar-event', {
        intervention: this.args.model,
        date: null, // ember-flatpickr cannot handle 'undefined'
      });
      await setCalendarEventProperties(visit, {
        intervention: this.args.model,
        calendarPeriod: new CalendarPeriod('GD'),
      });
      // don't save calendar-event yet. It's just a placeholder to fill in the form.
    }
  }

  @keepLatestTask
  *deleteCalendarEvent() {
    const visit = yield this.args.model.visit;
    yield visit?.destroyRecord();
    yield this.ensureCalendarEvent();
  }

  @action
  generateInterventionReport() {
    generateDocument(`/interventions/${this.args.model.id}/documents`, {
      record: this.args.model,
    });
  }

  @action
  async openEdit() {
    await this.ensureCalendarEvent();
    this.editMode = true;
  }

  @action
  async closeEdit() {
    this.editMode = false;
    const calendarEvent = await this.args.model.visit;
    if (calendarEvent && calendarEvent.isNew) {
      await calendarEvent.destroyRecord();
    }
  }
}

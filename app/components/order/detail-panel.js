import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask, task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import { setCalendarEventProperties } from '../../utils/calendar-helpers';
import CalendarPeriod from '../../classes/calendar-period';

export default class OrderDetailPanelComponent extends Component {
  @service store;

  @tracked editMode = false;
  @tracked isOpenCancellationModal = false;

  requestData = trackedFunction(this, async () => {
    return await this.case?.request;
  });

  get request() {
    return this.requestData.value;
  }

  get technicianNames() {
    return this.args.model.technicians.sortBy('firstName').mapBy('firstName');
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
      yield this.saveCalendarEvent.perform(planning);
    }
  }

  @keepLatestTask
  *synchronizeCalendarEvent() {
    const planning = yield this.args.model.planning;
    if (planning) {
      yield setCalendarEventProperties(planning, {
        order: this.args.model,
      });
      if (!planning.isNew) {
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
    this.request.visitor = visitor;
    yield this.request.save();
    const visit = yield this.request?.visit;
    if (visit) {
      yield setCalendarEventProperties(visit, {
        request: this.request,
      });
      yield visit.save();
    }
  }

  @action
  setTechnicians(employees) {
    this.args.model.technicians = employees;
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

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { keepLatestTask, task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import { isPresent } from '@ember/utils';
import { setCalendarEventProperties } from '../../utils/calendar-helpers';
import CalendarPeriod from '../../classes/calendar-period';

export default class InterventionDetailPanelComponent extends Component {
  @service router;
  @service store;
  @service sequence;
  @service documentGeneration;

  @tracked editMode = false;
  @tracked isOpenOptionsMenu = false;

  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  visitData = trackedFunction(this, async () => {
    return await this.args.model.visit;
  });

  get case() {
    return this.caseData.value;
  }

  get visit() {
    return this.visitData.value;
  }

  get technicianNames() {
    return this.args.model.technicians.sortBy('firstName').mapBy('firstName');
  }

  get isNbOfPersonsWarning() {
    return this.args.model.scheduledNbOfPersons != 2;
  }

  get isLinkedToCustomer() {
    return isPresent(this.case?.customer.get('id'));
  }

  get hasInvoice() {
    return isPresent(this.case?.invoice.get('id'));
  }

  get hasFollowUpRequest() {
    return isPresent(this.args.model.followUpRequest?.get('id'));
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
  *synchronizeCalendarEvent() {
    const visit = yield this.args.model.visit;
    if (visit) {
      yield setCalendarEventProperties(visit, {
        intervention: this.args.model,
      });
      if (!visit.isNew) {
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

  @task
  *createNewIntervention() {
    const [customer, contact, building, vatRate, employee, origin, number] = yield Promise.all([
      this.case.customer,
      this.case.contact,
      this.case.building,
      this.case.vatRate,
      this.args.model.employee,
      this.args.model.origin,
      this.sequence.fetchNextCaseNumber(),
    ]);

    const intervention = this.store.createRecord('intervention', {
      interventionDate: new Date(),
      number,
      employee,
      origin,
    });

    yield intervention.save();

    const _case = this.store.createRecord('case', {
      identifier: `IR-${number}`,
      customer,
      contact,
      building,
      vatRate,
      intervention,
    });
    yield _case.save();

    this.router.transitionTo('main.case.intervention.edit.index', _case.id, intervention.id);
  }

  @action
  generateInterventionReport() {
    return this.documentGeneration.interventionReport(this.args.model);
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
      await this.calendarEvent.destroyRecord();
    }
  }

  @action
  openOptionsMenu() {
    this.isOpenOptionsMenu = true;
  }

  @action
  closeOptionsMenu() {
    this.isOpenOptionsMenu = false;
  }
}

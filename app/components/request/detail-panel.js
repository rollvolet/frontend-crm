import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked, cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import { debug, warn } from '@ember/debug';
import { task, keepLatestTask } from 'ember-concurrency';
import { setCalendarEventProperties } from '../../utils/calendar-helpers';
import generateDocument from '../../utils/generate-document';
import CalendarPeriod from '../../classes/calendar-period';

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
      yield this.synchronizeCalendarEvent.perform();
      yield this.args.model.save();
    }
  }

  @task
  *setRequiresVisit(event) {
    const value = event.target.checked;

    if (value) {
      try {
        const visit = this.store.createRecord('calendar-event', {
          request: this.args.model,
          date: new Date(),
        });
        yield setCalendarEventProperties(visit, {
          request: this.args.model,
          calendarPeriod: new CalendarPeriod('GD'),
        });
        yield this.saveCalendarEvent.perform(visit);
      } catch (e) {
        warn(`Something went wrong while saving calendar event for request ${this.args.model.id}`, {
          id: 'create-failure',
        });
        this.args.model.belongsTo('visit').reload();
      }
    } else {
      const visit = yield this.args.model.visit;
      if (visit) {
        try {
          yield visit.destroyRecord();
        } catch (e) {
          warn(`Something went wrong while destroying calendar event ${visit.id}`, {
            id: 'destroy-failure',
          });
          debug(e);
        }
      }
    }
  }

  @keepLatestTask
  *updateCalendarPeriod(calendarPeriod) {
    const visit = yield this.args.model.visit;
    if (visit) {
      yield setCalendarEventProperties(visit, {
        request: this.args.model,
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
        request: this.args.model,
      });
      const mustUpdate = force || visit.hasDirtyAttributes;
      if (mustUpdate) {
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

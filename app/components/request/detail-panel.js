import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { trackedFunction } from 'ember-resources/util/function';
import { action } from '@ember/object';
import { debug, warn } from '@ember/debug';
import { isPresent } from '@ember/utils';
import { task, keepLatestTask } from 'ember-concurrency';
import { setCalendarEventProperties } from '../../utils/calendar-helpers';
import generateDocument from '../../utils/generate-document';
import CalendarPeriod from '../../classes/calendar-period';

export default class RequestDetailPanelComponent extends Component {
  @service store;

  @tracked editMode = false;

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

  get isLinkedToCustomer() {
    return isPresent(this.case?.customer.get('id'));
  }

  get hasOffer() {
    return isPresent(this.case?.offer.get('id'));
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

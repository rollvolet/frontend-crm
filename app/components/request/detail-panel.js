import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { trackedFunction } from 'ember-resources/util/function';
import { action } from '@ember/object';
import { debug, warn } from '@ember/debug';
import { isPresent } from '@ember/utils';
import { task, keepLatestTask } from 'ember-concurrency';
import { setCalendarEventProperties } from '../../utils/calendar-helpers';
import CalendarPeriod from '../../classes/calendar-period';

export default class RequestDetailPanelComponent extends Component {
  @service documentGeneration;
  @service store;

  @tracked editMode = false;
  @tracked isOpenOptionsMenu = false;
  @tracked isOpenCancellationModal = false;

  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  get case() {
    return this.caseData.value;
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

  get hasOptionsMenu() {
    // There are no options to show for a request which already has an offer
    return this.case?.isCancelled || !this.hasOffer;
  }

  @keepLatestTask
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid) {
      const visit = yield this.args.model.visit;
      if (visit) {
        yield this.synchronizeCalendarEvent.perform(visit);
      }
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
      yield this.saveCalendarEvent.perform(visit);
    }
  }

  @keepLatestTask
  *synchronizeCalendarEvent(calendarEvent) {
    yield setCalendarEventProperties(calendarEvent, {
      request: this.args.model,
    });
    yield this.saveCalendarEvent.perform(calendarEvent);
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
    return this.documentGeneration.visitReport(this.args.model);
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  closeEdit() {
    this.editMode = false;
  }

  @action
  openOptionsMenu() {
    this.isOpenOptionsMenu = true;
  }

  @action
  closeOptionsMenu() {
    this.isOpenOptionsMenu = false;
  }

  @action
  cancelRequest() {
    this.closeOptionsMenu();
    this.isOpenCancellationModal = true;
  }

  @action
  closeCancellationModal() {
    this.isOpenCancellationModal = false;
    this.args.model.cancellationReason = null;
  }

  @action
  confirmCancellation(reason) {
    this.isOpenCancellationModal = false;
    this.args.model.cancellationReason = reason;
    this.args.model.cancellationDate = new Date();
    this.save.perform();
  }

  @action
  uncancelRequest() {
    this.closeOptionsMenu();
    this.args.model.cancellationReason = null;
    this.args.model.cancellationDate = null;
    this.save.perform();
  }
}

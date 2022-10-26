import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debug, warn } from '@ember/debug';
import { task, keepLatestTask } from 'ember-concurrency';
import { setCalendarEventProperties } from '../../utils/calendar-helpers';
import CalendarPeriod from '../../classes/calendar-period';

export default class RequestDetailPanelComponent extends Component {
  @service case;
  @service documentGeneration;
  @service store;

  @tracked editMode = false;
  @tracked isOpenOptionsMenu = false;
  @tracked isOpenCancellationModal = false;
  @tracked visitor;
  @tracked employee;
  @tracked calendarEvent;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const model = this.args.model;
    if (model.employee)
      this.employee = this.store.peekAll('employee').find((e) => e.firstName == model.employee);
    if (model.visitor)
      this.visitor = this.store.peekAll('employee').find((e) => e.firstName == model.visitor);

    // TODO fetch via relation once request is converted to triplestore
    this.calendarEvent = yield this.store.queryOne('calendar-event', {
      'filter[:exact:request]': this.args.model.uri,
    });
  }

  get isLinkedToCustomer() {
    return this.case.current && this.case.current.customer != null;
  }

  get hasOffer() {
    return this.case.current && this.case.current.offer != null;
  }

  get isLimitedEdit() {
    return this.hasOffer;
  }

  get hasOptionsMenu() {
    // There are no options to show for a request which already has an offer
    return this.args.model.isCancelled || !this.hasOffer;
  }

  @keepLatestTask
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid) {
      if (this.calendarEvent) {
        const changedAttributes = this.args.model.changedAttributes();
        if (changedAttributes['visitor'] || changedAttributes['description']) {
          yield this.synchronizeCalendarEvent.perform();
        }
      }
      yield this.args.model.save();
    }
  }

  @task
  *setRequiresVisit(event) {
    const value = event.target.checked;
    this.args.model.requiresVisit = value;

    if (value) {
      try {
        this.calendarEvent = this.store.createRecord('calendar-event', {
          request: this.args.model.uri,
          date: new Date(),
        });
        yield setCalendarEventProperties(this.calendarEvent, {
          request: this.args.model,
          customer: this.case.current.customer,
          building: this.case.current.building,
          visitor: this.case.visitor,
          calendarPeriod: new CalendarPeriod('GD'),
        });
        yield this.saveCalendarEvent.perform();
      } catch (e) {
        warn(`Something went wrong while saving calendar event for request ${this.args.model.id}`, {
          id: 'create-failure',
        });
        this.args.model.visitDate = null;
        this.args.model.requiresVisit = false;
        this.save.perform();
      }
    } else {
      if (this.calendarEvent) {
        try {
          yield this.calendarEvent.destroyRecord();
          this.calendarEvent = null;
        } catch (e) {
          warn(`Something went wrong while destroying calendar event ${this.calendarEvent.id}`, {
            id: 'destroy-failure',
          });
          debug(e);
        }
      }
      this.args.model.visitDate = null;
    }

    this.save.perform();
  }

  @keepLatestTask
  *updateCalendarPeriod(calendarPeriod) {
    if (this.calendarEvent) {
      yield setCalendarEventProperties(this.calendarEvent, {
        request: this.args.model,
        customer: this.case.current.customer,
        building: this.case.current.building,
        visitor: this.case.visitor,
        calendarPeriod,
      });
      yield this.saveCalendarEvent.perform();
    }
  }

  @keepLatestTask
  *synchronizeCalendarEvent() {
    if (this.calendarEvent) {
      yield setCalendarEventProperties(this.calendarEvent, {
        request: this.args.model,
        customer: this.case.current.customer,
        building: this.case.current.building,
        visitor: this.case.visitor,
      });
      yield this.saveCalendarEvent.perform();
    }
  }

  @keepLatestTask
  *saveCalendarEvent() {
    const { validations } = yield this.calendarEvent.validate();
    if (validations.isValid) {
      yield this.calendarEvent.save();
      // TODO remove once requests are converted to triplestore and
      // link with calendar-event can be established
      const visitDateRequiresUpdate =
        this.args.model.visitDate?.toISOString() != this.calendarEvent.date?.toISOString();
      if (visitDateRequiresUpdate) {
        this.args.model.visitDate = this.calendarEvent.date;
        yield this.args.model.save();
      }
    }
  }

  @action
  generateVisitReport() {
    return this.documentGeneration.visitReport(this.args.model);
  }

  @action
  setEmployee(employee) {
    this.employee = employee;
    this.args.model.employee = employee ? employee.firstName : null;
  }

  @action
  setVisitor(visitor) {
    this.visitor = visitor;
    this.args.model.visitor = visitor ? visitor.firstName : null;
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

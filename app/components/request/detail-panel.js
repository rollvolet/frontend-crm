import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, keepLatestTask } from 'ember-concurrency-decorators';
import { debug, warn } from '@ember/debug';
import { unlocalize } from '../../utils/date-helpers';

export default class RequestDetailPanelComponent extends Component {
  @service case;
  @service documentGeneration;
  @service store;

  @tracked editMode = false;
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
      this.employee = this.store.peekAll('employee').find(e => e.firstName == model.employee);
    if (model.visitor)
      this.visitor = this.store.peekAll('employee').find(e => e.firstName == model.visitor);

    this.calendarEvent = yield model.calendarEvent;
  }

  get hasVisitMasteredByAccess() {
    return this.calendarEvent && this.calendarEvent.isMasteredByAccess;
  }

  get isLinkedToCustomer() {
    return this.case.current.customer != null;
  }

  @keepLatestTask
  *save() {
    const { validations } = yield this.args.model.validate();
    if (validations.isValid) {
      if (this.args.model.changedAttributes()['comment']) {
        yield this.args.model.save();
        // reload after save so calendar event has been updated
        this.args.model.belongsTo('calendarEvent').reload();
      } else {
        yield this.args.model.save();
      }
    }
  }

  @task
  *setRequiresVisit(event) {
    const value = event.target.checked;
    this.args.model.requiresVisit = value;
    this.save.perform();

    if (value) {
      try {
        this.calendarEvent = this.store.createRecord('calendar-event', {
          request: this.args.model,
          visitDate: new Date(),
          period: 'GD'
        });
        yield this.saveCalendarEvent.perform();
      } catch (e) {
        warn(`Something went wrong while saving calendar event for request ${this.args.model.id}`, { id: 'create-failure' });
        this.args.model.requiresVisit = false;
        this.save.perform();
      }
    } else if (this.calendarEvent) {
      try {
        yield this.calendarEvent.destroyRecord();
        this.args.model.calendarEvent = null;
        this.calendarEvent = null;
      } catch (e) {
        warn(`Something went wrong while destroying calendar event ${this.calendarEvent.id}`, { id: 'destroy-failure' });
        debug(e);
      }
    }
  }

  @task
  *saveCalendarEvent() {
    const { validations } = yield this.calendarEvent.validate();
    if (validations.isValid)
      yield this.calendarEvent.save();
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
  setRequestDate(dates) {
    this.args.model.requestDate = unlocalize(dates[0]);
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

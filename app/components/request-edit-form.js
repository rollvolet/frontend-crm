import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { notEmpty, bool } from '@ember/object/computed';
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { warn, debug } from '@ember/debug';

@classic
export default class RequestEditForm extends Component {
  @service
  store;

  model = null;
  save = null;
  employee = null;

  init() {
    super.init(...arguments);
    if (this.model.employee) {
      const employee = this.store.peekAll('employee').find(e => e.firstName == this.model.employee);
      this.set('employee', employee);
    }
    if (this.model.visitor) {
      const visitor = this.store.peekAll('employee').find(e => e.firstName == this.model.visitor);
      this.set('visitor', visitor);
    }
  }

  @bool('model.calendarEvent.isMasteredByAccess')
  hasVisitMasteredByAccess;

  @notEmpty('model.customer.id')
  isLinkedToCustomer;

  @task(function * () {
    const calendarEvent = yield this.model.calendarEvent;
    try {
      yield calendarEvent.destroyRecord();
      // TODO: Fix this hack when Ember Data allows creation of already deleted ID
      // See https://github.com/emberjs/data/issues/5006
      this.store._internalModelsFor('calendar-event').remove(calendarEvent._internalModel, calendarEvent.id);
      this.model.set('calendarEvent', null);
    } catch (e) {
      warn(`Something went wrong while destroying calendar event ${calendarEvent.id}`, { id: 'destroy-failure' });
      debug(e);
    }
  })
  removeVisit;

  @task(function * () {
    this.store.createRecord('calendar-event', {
      request: this.model,
      visitDate: new Date(),
      period: 'GD'
    });
    yield this.saveCalendarEvent.perform();
  })
  createVisit;

  @task(function * () {
    const calendarEvent = yield this.model.calendarEvent;
    const { validations } = yield calendarEvent.validate();
    if (validations.isValid)
      yield calendarEvent.save();
  })
  saveCalendarEvent;

  @action
  setRequiresVisit(value) {
    this.model.set('requiresVisit', value);
    this.save.perform();

    if (value) {
      this.createVisit.perform();
    } else {
      this.removeVisit.perform();
    }
  }

  @action
  setEmployee(employee) {
    this.set('employee', employee);
    const firstName = employee ? employee.firstName : null;
    this.model.set('employee', firstName);
  }

  @action
  setVisitor(visitor) {
    this.set('visitor', visitor);
    const firstName = visitor ? visitor.firstName : null;
    this.model.set('visitor', firstName);
  }
}

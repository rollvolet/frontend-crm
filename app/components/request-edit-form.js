import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { warn, debug } from '@ember/debug';
import { bool, notEmpty } from '@ember/object/computed';

export default Component.extend({
  store: service(),

  model: null,
  save: null,

  employee: null,

  init() {
    this._super(...arguments);
    if (this.model.employee) {
      const employee = this.store.peekAll('employee').find(e => e.firstName == this.model.employee);
      this.set('employee', employee);
    }
    if (this.model.visitor) {
      const visitor = this.store.peekAll('employee').find(e => e.firstName == this.model.visitor);
      this.set('visitor', visitor);
    }
  },

  hasVisitMasteredByAccess: bool('model.calendarEvent.isMasteredByAccess'),
  isLinkedToCustomer: notEmpty('model.customer.id'),

  removeVisit: task(function * () {
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
  }),
  createVisit: task(function * () {
    this.store.createRecord('calendar-event', {
      request: this.model,
      visitDate: new Date(),
      period: 'GD'
    });
    yield this.saveCalendarEvent.perform();
  }),
  saveCalendarEvent: task(function * () {
    const calendarEvent = yield this.model.calendarEvent;
    const { validations } = yield calendarEvent.validate();
    if (validations.isValid)
      yield calendarEvent.save();
  }),

  actions: {
    setRequiresVisit(value) {
      this.model.set('requiresVisit', value);
      this.save.perform();

      if (value) {
        this.createVisit.perform();
      } else {
        this.removeVisit.perform();
      }
    },
    setEmployee(employee) {
      this.set('employee', employee);
      const firstName = employee ? employee.firstName : null;
      this.model.set('employee', firstName);
    },
    setVisitor(visitor) {
      this.set('visitor', visitor);
      const firstName = visitor ? visitor.firstName : null;
      this.model.set('visitor', firstName);
    }
  }
});

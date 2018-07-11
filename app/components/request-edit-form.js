import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { warn } from '@ember/debug';
import { bool } from '@ember/object/computed';

export default Component.extend({
  store: service(),

  model: null,
  save: null,
  onContactChange: null,
  onBuildingChange: null,

  employee: null,

  init() {
    this._super(...arguments);
    if (this.model.employee) {
      const employee = this.store.peekAll('employee').find(e => e.firstName == this.model.employee);
      this.set('employee', employee);
    }
    this.model.visit.then(visit => {
      if (visit && visit.visitor) {
        const visitor = this.store.peekAll('employee').find(e => e.firstName == visit.visitor);
        this.set('visitor', visitor);
      }
    });
  },

  hasVisitMasteredByAccess: bool('model.visit.isMasteredByAccess'),

  removeVisit: task(function * () {
    const visit = yield this.model.get('visit');
    try {
      yield visit.destroyRecord();
      this.model.set('visit', null);
      this.set('visitor', null);
    } catch (e) {
      warn(`Something went wrong while destroying visit ${visit.id}`, { id: 'destroy-failure' });
    }
  }),
  createVisit: task(function * () {
    this.store.createRecord('visit', {
      request: this.model,
      visitDate: new Date(),
      period: 'GD',
      offerExpected: false
    });
    yield this.saveVisit.perform();
  }),
  saveVisit: task(function * () {
    const visit = yield this.model.visit;
    const { validations } = yield visit.validate();
    if (validations.isValid)
      yield visit.save();
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
    setVisitor(visitor) {
      this.set('visitor', visitor);
      const firstName = visitor ? visitor.firstName : null;
      this.model.set('visit.visitor', firstName);
    },
    setEmployee(employee) {
      this.set('employee', employee);
      const firstName = employee ? employee.firstName : null;
      this.model.set('employee', firstName);
    },
    setContact(contact) {
      this.set('model.contact', contact);
      this.onContactChange(contact);
    },
    setBuilding(building) {
      this.set('model.building', building);
      this.onBuildingChange(building);
    }
  }
});

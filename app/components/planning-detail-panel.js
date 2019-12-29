import Component from '@ember/component';
import fetch, { Headers } from 'fetch';
import { task } from 'ember-concurrency';
import { notEmpty, reads } from '@ember/object/computed';
import { not, and, isEmpty } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';

export default Component.extend({
  case: service(),
  session: service(),

  calendarSubject: null,
  editMode: false,
  model: null,

  isDisabledEdit: notEmpty('model.invoice.id'),
  inputDateStr: reads('model.planningDateStr'),
  isNotAvailableInCalendar: and('loadCalendarEvent.lastSuccessful', not('model.isPlanningMasteredByAccess'), 'model.planningMsObjectId', isEmpty('calendarSubject')),

  init() {
    this._super(...arguments);
    this.loadCalendarEvent.perform();
    this.case.on('updateBuilding:succeeded', this, this.handleBuildingUpdatedEvent);
  },

  willDestroyElement() {
    this.case.off('updateBuilding:succeeded', this, this.handleBuildingUpdatedEvent);
    this._super(...arguments);
  },

  handleBuildingUpdatedEvent() {
    this.loadCalendarEvent.perform();
  },

  loadCalendarEvent: task(function * () {
    if (this.model.planningMsObjectId) {
      const { access_token } = this.get('session.data.authenticated');
      const result = yield fetch(`/api/calendars/planning/${this.model.planningMsObjectId}/subject`, {
        method: 'GET',
        headers: new Headers({
          Authorization: `Bearer ${access_token}`
        })
      });

      if (result.ok) {
        const { subject } = yield result.json();
        this.set('calendarSubject', subject);
      } else {
        this.set('calendarSubject', null);
      }
    } else {
      this.set('calendarSubject', null);
    }
  }),

  planEvent: task(function * () {
    if (this.model.planningDateStr != this.inputDateStr) {
      this.model.set('planningDateStr', this.inputDateStr);
      yield this.model.save();
      yield this.loadCalendarEvent.perform();
    }

    this.set('editMode', false);
  }),

  synchronize: task(function * () {
    const { access_token } = this.get('session.data.authenticated');
    yield fetch(`/api/orders/${this.model.id}/planning-event`, {
      method: 'PUT',
      headers: new Headers({
        Authorization: `Bearer ${access_token}`
      })
    });

    if (this.isNotAvailableInCalendar)
      yield this.model.reload(); // order.planningMsObjectId will be updated

    yield this.loadCalendarEvent.perform();
  }).keepLatest(),

  actions: {
    openEdit() {
      this.set('editMode', true);
      next(this, function() { this.element.querySelector('input').focus(); });
    },
    async remove() {
      this.set('inputDateStr', null);
      await this.planEvent.perform();
    }
  }
});

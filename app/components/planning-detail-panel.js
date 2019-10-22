import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { notEmpty, reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';

export default Component.extend({
  ajax: service(),
  session: service(),

  calendarSubject: null,
  editMode: false,
  model: null,

  isDisabledEdit: notEmpty('model.invoice.id'),
  inputDateStr: reads('model.planningDateStr'),

  init() {
    this._super(...arguments);
    this.loadCalendarEvent.perform();
  },

  loadCalendarEvent: task(function * () {
    if (this.model.planningMsObjectId) {
      const { access_token } = this.get('session.data.authenticated');
      const headers = { 'Authorization': `Bearer ${access_token}` };
      const url = `/api/calendars/planning/${this.model.planningMsObjectId}/subject`;
      const { subject } = yield this.ajax.request(url, { headers });
      this.set('calendarSubject', subject);
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
    const headers = { 'Authorization': `Bearer ${access_token}` };
    yield this.ajax.put(`/api/orders/${this.model.id}/planning-event`, { headers });
    yield this.loadCalendarEvent.perform();
  }).keepLatest(),

  actions: {
    openEdit() {
      this.set('editMode', true);
      next(this, function() { this.element.querySelector('input').focus(); });
    }
  }
});

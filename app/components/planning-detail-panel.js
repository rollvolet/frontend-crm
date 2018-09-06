import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { notEmpty, reads } from '@ember/object/computed';

export default Component.extend({
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
      // TODO Load calendar subject from background
      this.set('calendarSubject', 'Some calendar subject must be shown here');
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

  actions: {
    openEdit() {
      this.set('editMode', true);
    }
  }
});

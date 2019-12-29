import Component from '@ember/component';
import fetch, { Headers } from 'fetch';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { task } from 'ember-concurrency';
import { and, isEmpty } from 'ember-awesome-macros';

export default Component.extend({
  session: service(),

  model: null,

  calendarEvent: reads('model.calendarEvent'),
  isNotAvailableInCalendar: and('calendarEvent.id', isEmpty('calendarEvent.calendarSubject')),

  synchronize: task(function * () {
    const { access_token } = this.get('session.data.authenticated');
    yield fetch(`/api/orders/${this.model.id}/planning-event`, {
      method: 'PUT',
      headers: new Headers({
        Authorization: `Bearer ${access_token}`
      })
    });
    yield this.model.belongsTo('calendarEvent').reload();
  }).keepLatest()
});

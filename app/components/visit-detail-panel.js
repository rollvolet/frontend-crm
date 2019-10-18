import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { task } from 'ember-concurrency';

export default Component.extend({
  session: service(),
  ajax: service(),

  model: null,

  calendarEvent: reads('model.calendarEvent'),

  synchronize: task(function * () {
    const { access_token } = this.get('session.data.authenticated');
    const headers = { 'Authorization': `Bearer ${access_token}` };
    yield this.ajax.put(`/api/requests/${this.model.id}/calendar-event`, { headers });
    yield this.model.belongsTo('calendarEvent').reload();
  }).keepLatest()
});

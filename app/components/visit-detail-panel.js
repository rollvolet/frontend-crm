import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import fetch, { Headers } from 'fetch';
import { task } from 'ember-concurrency';
import { and, isEmpty } from 'ember-awesome-macros';

@classic
export default class VisitDetailPanel extends Component {
  @service
  session;

  model = null;

  @reads('model.calendarEvent')
  calendarEvent;

  @and('calendarEvent.id', isEmpty('calendarEvent.calendarSubject'))
  isNotAvailableInCalendar;

  @(task(function * () {
    const { access_token } = this.get('session.data.authenticated');
    yield fetch(`/api/orders/${this.model.id}/planning-event`, {
      method: 'PUT',
      headers: new Headers({
        Authorization: `Bearer ${access_token}`
      })
    });
    yield this.model.belongsTo('calendarEvent').reload();
  }).keepLatest())
  synchronize;
}

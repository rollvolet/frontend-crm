import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import fetch, { Headers } from 'fetch';
import { task } from 'ember-concurrency';
import { and, isEmpty } from 'ember-awesome-macros';

@classic
export default class VisitDetailPanel extends Component {
  @service
  session;

  model = null;

  init() {
    super.init(...arguments);
    this.loadCalendarEvent.perform();
  }

  @and('model.calendarEvent.id', isEmpty('model.calendarEvent.calendarSubject'))
  isNotAvailableInCalendar;

  @(task(function * () {
    // TODO fix loading state of calendar-event retrieval
    yield this.model.get('calendarEvent');
  }).keepLatest())
  loadCalendarEvent;

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

import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads, notEmpty } from '@ember/object/computed';
import Component from '@ember/component';
import fetch, { Headers } from 'fetch';
import { task } from 'ember-concurrency';
import { not, and, isEmpty } from 'ember-awesome-macros';
import { next } from '@ember/runloop';

@classic
export default class PlanningDetailPanel extends Component {
  @service
  case;

  @service
  session;

  calendarSubject = null;
  editMode = false;
  model = null;

  @notEmpty('model.invoice.id')
  isDisabledEdit;

  @reads('model.planningDateStr')
  inputDateStr;

  @and(
    'loadCalendarEvent.lastSuccessful',
    not('model.isPlanningMasteredByAccess'),
    'model.planningMsObjectId',
    isEmpty('calendarSubject')
  )
  isNotAvailableInCalendar;

  init() {
    super.init(...arguments);
    this.loadCalendarEvent.perform();
    this.case.on('updateBuilding:succeeded', this, this.handleBuildingUpdatedEvent);
  }

  willDestroyElement() {
    this.case.off('updateBuilding:succeeded', this, this.handleBuildingUpdatedEvent);
    super.willDestroyElement(...arguments);
  }

  handleBuildingUpdatedEvent() {
    this.loadCalendarEvent.perform();
  }

  @task(function * () {
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
  })
  loadCalendarEvent;

  @task(function * () {
    if (this.model.planningDateStr != this.inputDateStr) {
      this.model.set('planningDateStr', this.inputDateStr);
      yield this.model.save();
      yield this.loadCalendarEvent.perform();
    }

    this.set('editMode', false);
  })
  planEvent;

  @(task(function * () {
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
  }).keepLatest())
  synchronize;

  @action
  openEdit() {
    this.set('editMode', true);
    next(this, function() { this.element.querySelector('input').focus(); });
  }

  @action
  async remove() {
    this.set('inputDateStr', null);
    await this.planEvent.perform();
  }
}

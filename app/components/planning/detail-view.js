import Component from '@glimmer/component';
import fetch, { Headers } from 'fetch';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { keepLatestTask } from 'ember-concurrency-decorators';

export default class PlanningDetailViewComponent extends Component {
  @service case

  @tracked calendarEvent

  constructor() {
    super(...arguments);
    this.loadCalendarEvent.perform();
    this.case.on('updateBuilding:succeeded', this, this.handleBuildingUpdatedEvent);
  }

  willDestroy() {
    this.case.off('updateBuilding:succeeded', this, this.handleBuildingUpdatedEvent);
    super.willDestroy(...arguments);
  }

  handleBuildingUpdatedEvent() {
    this.loadCalendarEvent.perform();
  }

  get isNotAvailableInCalendar() {
    return this.loadCalendarEvent.lastSuccessful
      && !this.args.model.isPlanningMasteredByAccess
      && this.args.model.isPlanned
      && isEmpty(this.calendarSubject);
  }

  @keepLatestTask
  *loadCalendarEvent() {
    if (this.args.model.isPlanned) {
      const result = yield fetch(`/api/calendars/planning/${this.args.model.planningMsObjectId}/subject`, {
        headers: new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/json'
        })
      });

      if (result.ok) {
        const { subject } = yield result.json();
        this.calendarSubject = subject;
      } else {
        this.calendarSubject = null;
      }
    } else {
      this.calendarSubject = null;
    }
  }

  @keepLatestTask
  *synchronize() {
    const resource = this.args.model.constructor.modelName == 'order' ? 'orders' : 'interventions';
    yield fetch(`/api/${resource}/${this.args.model.id}/planning-event`, {
      method: 'PUT',
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      })
    });

    if (this.isNotAvailableInCalendar)
      yield this.args.model.reload(); // order.planningMsObjectId will be updated

    yield this.loadCalendarEvent.perform();
  }
}

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { keepLatestTask, task } from 'ember-concurrency-decorators';
import fetch from 'fetch';
import { isEmpty } from '@ember/utils';

export default class PlanningPanelComponent extends Component {
  @service case

  @tracked editMode
  @tracked calendarSubject
  @tracked inputDateStr

  constructor() {
    super(...arguments);
    this.loadCalendarEvent.perform();
    this.inputDateStr = this.args.model.planningDateStr;
    this.case.on('updateBuilding:succeeded', this, this.handleBuildingUpdatedEvent);
  }

  willDestroy() {
    this.case.off('updateBuilding:succeeded', this, this.handleBuildingUpdatedEvent);
    super.willDestroy(...arguments);
  }

  handleBuildingUpdatedEvent() {
    this.loadCalendarEvent.perform();
  }

  get invoice() {
    return this.case.current && this.case.current.invoice;
  }

  get isDisabledEdit() {
    return this.invoice;
  }

  get inputDateStr() {
    return this.args.model.planningDateStr;
  }

  get isNotAvailableInCalendar() {
    return this.loadCalendarEvent.lastSuccessful
      && !this.args.model.isPlanningMasteredByAccess
      && this.args.model.isPlanned
      && isEmpty(this.calendarSubject)
      && !this.planEvent.isRunning;
  }

  @task
  *loadCalendarEvent() {
    if (this.args.model.isPlanned) {
      const result = yield fetch(`/api/calendars/planning/${this.args.model.planningMsObjectId}/subject`);

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

  @task
  *planEvent() {
    if (this.args.model.planningDateStr != this.inputDateStr) {
      this.args.model.planningDateStr = this.inputDateStr;
      yield this.args.model.save();
      yield this.loadCalendarEvent.perform();
    }

    this.editMode = false;
  }

  @keepLatestTask
  *synchronize() {
    const resource = this.args.model.constructor.modelName == 'order' ? 'orders' : 'interventions';
    yield fetch(`/api/${resource}/${this.args.model.id}/planning-event`, {
      method: 'PUT',
    });

    if (this.isNotAvailableInCalendar)
      yield this.args.model.reload(); // order.planningMsObjectId will be updated

    yield this.loadCalendarEvent.perform();
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  async remove() {
    this.inputDateStr = null;
    await this.planEvent.perform();
  }

}

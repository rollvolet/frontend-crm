import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { isEmpty } from '@ember/utils';

export default class PlanningEventPanelComponent extends Component {
  @service case
  @service session

  @tracked editMode

  constructor() {
    super(...arguments);
    this.case.on('updateBuilding:succeeded', this, this.handleBuildingUpdatedEvent);
  }

  willDestroy() {
    this.case.off('updateBuilding:succeeded', this, this.handleBuildingUpdatedEvent);
    super.willDestroy(...arguments);
  }

  handleBuildingUpdatedEvent() {
    this.args.model.reload();
  }

  get invoice() {
    return this.case.current && this.case.current.invoice;
  }

  get isDisabledEdit() {
    return this.invoice;
  }

  get requiresTimeRange() {
    return this.args.model.period == 'van-tot';
  }

  get requiresSingleTime() {
    return ['vanaf', 'bepaald uur', 'stipt uur', 'benaderend uur'].includes(this.args.model.period);
  }

  get requiresNoTime() {
    return !this.requiresTimeRange && !this.requiresSingleTime;
  }

  @task
  *forceUpdate() {
    yield this.args.model.save();
    this.editMode = false;
  }

  @task
  *planEvent() {
    if (this.args.model.hasDirtyAttributes)
      yield this.args.model.save();
    this.editMode = false;
  }

  @action
  openEdit() {
    this.editMode = true;
  }

  @action
  changeDate(date) {
    // Set default period on first selection of date
    if (this.args.model.dateStr == null)
      this.args.model.period = 'GD';

    // Set date
    this.args.model.dateStr = date;

    // Remove period on removal of date
    if (!date)
      this.args.model.period = null;
  }

  @action
  changePeriod(period) {
    this.args.model.period = period;

    if (period) {
      if (this.requiresSingleTime) {
        this.args.model.untilHour = null;
      } else if (this.requiresNoTime) {
        this.args.model.fromHour = null;
        this.args.model.untilHour = null;
      }
    }
  }

  @action
  undo() {
    this.args.model.rollbackAttributes();
    this.editMode = false;
  }

  @action
  async remove() {
    this.args.model.period = null;
    this.args.model.dateStr = null;
    await this.planEvent.perform();
  }
}

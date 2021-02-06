import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class VisitDetailEditComponent extends Component {
  get requiresNoTime() {
    return !this.requiresTimeRange && !this.requiresSingleTime;
  }

  get requiresTimeRange() {
    return this.args.model.period == 'van-tot';
  }

  get requiresSingleTime() {
    return ['vanaf', 'bepaald uur', 'stipt uur', 'benaderend uur'].includes(this.args.model.period);
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

    this.args.saveTask.perform();
  }
}

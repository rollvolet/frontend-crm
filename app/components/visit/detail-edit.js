import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class VisitDetailEditComponent extends Component {
  @service store

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
        this.model.untilHour = null;
      } else if (this.requiresNoTime) {
        this.model.fromHour = null;
        this.model.untilHour = null;
      }
    }

    this.args.save.perform();
  }
}

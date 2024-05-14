import Component from '@glimmer/component';
import { isPresent } from '@ember/utils';

export default class TimeSlotDetailViewComponent extends Component {
  get isScheduled() {
    return isPresent(this.args.model?.id);
  }
}

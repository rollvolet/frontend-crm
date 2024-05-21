import Component from '@glimmer/component';
import { isBlank } from '@ember/utils';
import isPast from 'date-fns/isPast';

export default class TimeSlotDetailViewComponent extends Component {
  get isUnscheduled() {
    return isBlank(this.args.model?.id);
  }

  get isOverdue() {
    return this.isUnscheduled && isPast(this.args.date);
  }

  get borderColor() {
    if (this.isOverdue) {
      return 'border-red-400';
    } else if (this.isUnscheduled) {
      return 'border-gray-400';
    } else {
      return null;
    }
  }

  get bgColor() {
    if (this.isOverdue) {
      return 'bg-red-400';
    } else if (this.isUnscheduled) {
      return 'bg-gray-400';
    } else {
      return null;
    }
  }
}

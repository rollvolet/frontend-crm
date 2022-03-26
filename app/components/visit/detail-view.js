import Component from '@glimmer/component';
import { keepLatestTask } from 'ember-concurrency';

export default class VisitDetailViewComponent extends Component {
  get notAvailableInCalendar() {
    return this.args.model && !this.args.model.isAvailableInCalendar;
  }

  @keepLatestTask
  *synchronize() {
    yield this.args.onSynchronize();
  }
}

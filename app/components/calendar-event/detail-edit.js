import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import CalendarPeriod from '../../classes/calendar-period';

export default class CalendarEventDetailEditComponent extends Component {
  @cached
  get calendarPeriod() {
    if (this.args.model) {
      return CalendarPeriod.parse(this.args.model.subject);
    } else {
      return null;
    }
  }

  @action
  changePeriod(period) {
    this.calendarPeriod.period = period;
    if (this.calendarPeriod.requiresSingleTime) {
      this.calendarPeriod.untilHour = null;
    } else if (this.calendarPeriod.requiresNoTime) {
      this.calendarPeriod.fromHour = null;
      this.calendarPeriod.untilHour = null;
    }
    this.saveCalendarPeriodChange();
  }

  @action
  saveCalendarPeriodChange() {
    if (this.calendarPeriod.isValid) {
      this.args.onCalendarPeriodChange(this.calendarPeriod);
    }
  }

  @task
  *delete() {
    if (this.args.onDelete) {
      yield this.args.onDelete();
    }
  }
}

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import CalendarPeriod from '../../classes/calendar-period';

export default class TimeSlotDetailEditComponent extends Component {
  @cached
  get calendarPeriod() {
    if (this.args.period) {
      return CalendarPeriod.parse(this.args.period);
    } else {
      return null;
    }
  }

  @action
  changeDate(date) {
    this.args.onChange(date, this.calendarPeriod.toSubjectString());
  }

  @action
  selectPeriod(period) {
    this.calendarPeriod.period = period;
    if (this.calendarPeriod.requiresSingleTime) {
      this.calendarPeriod.untilHour = null;
    } else if (this.calendarPeriod.requiresNoTime) {
      this.calendarPeriod.fromHour = null;
      this.calendarPeriod.untilHour = null;
    }

    if (this.calendarPeriod.isValid) {
      this.args.onChange(this.args.date, this.calendarPeriod.toSubjectString());
    }
  }

  @action
  changePeriod() {
    if (this.calendarPeriod.isValid) {
      this.args.onChange(this.args.date, this.calendarPeriod.toSubjectString());
    }
  }

  @task
  *delete() {
    if (this.args.onDelete) {
      yield this.args.onDelete();
    }
  }
}

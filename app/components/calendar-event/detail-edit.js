import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { trackedFunction } from 'ember-resources/util/function';
import CalendarPeriod from '../../classes/calendar-period';

export default class CalendarEventDetailEditComponent extends Component {
  calendarPeriodData = trackedFunction(this, () => {
    if (this.args.model) {
      return CalendarPeriod.parse(this.args.model.subject);
    } else {
      return null;
    }
  });

  get calendarPeriod() {
    return this.calendarPeriodData.value;
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

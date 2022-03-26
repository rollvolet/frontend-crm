import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import CalendarPeriod from '../../classes/calendar-period';

export default class VisitDetailEditComponent extends Component {
  @tracked calendarPeriod;

  constructor() {
    super(...arguments);
    if (this.args.model) {
      this.calendarPeriod = CalendarPeriod.parse(this.args.model.subject);
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
}

import Model, { attr } from '@ember-data/model';
import constants from '../config/constants';
const { CALENDAR_DAY_STATUSES, TIME_INTERVAL_UNIT_TYPES } = constants;

export default class CalendarDayModel extends Model {
  @attr('string') uri;
  @attr('string') comment;
  @attr('string', {
    defaultValue() {
      return CALENDAR_DAY_STATUSES.FREE;
    },
  })
  visitStatus;
  @attr('number') day;
  @attr('number') month;
  @attr('number') year;
  @attr('string', {
    defaultValue() {
      return TIME_INTERVAL_UNIT_TYPES.DAY;
    },
  })
  unitType;

  get isVisitsFull() {
    return this.visitStatus == CALENDAR_DAY_STATUSES.FULL;
  }

  toDate() {
    return new Date(Date.parse(`${this.year}-${this.month}-${this.day}`));
  }
}

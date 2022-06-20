import { tracked } from '@glimmer/tracking';
import { isBlank } from '@ember/utils';

// Note: the order of the capturing groups in a regex is important.
// Therefore, when updating this regex the getters depending on the capturing groups
// need to be refactored as well.
// - Group 0: full time specification string
// - Group 1: from time of 'vanaf'
// - Group 2: from time of 'rond'
// - Group 3: from time of 'bepaald uur' or 'stipt uur'
// - Group 4: '(stipt)' flag
// - Group 5: from time of 'van-tot'
// - Group 6: until time of 'van-tot'
const periodRegex =
  /^GD|^NM|^VM|^vanaf([\d:.\s]*)\s*uur|^rond([\d:.\s]*)\s*uur|^([\d:.\s]*)\s*uur\s(\(stipt\))?|^([\d:.\su]*)-([^|]*)/;

export default class CalendarPeriod {
  @tracked period;
  @tracked fromHour;
  @tracked untilHour;

  constructor(period, from = null, until = null) {
    this.period = period;
    this.fromHour = from;
    this.untilHour = until;
  }

  get requiresNoTime() {
    return !this.requiresTimeRange && !this.requiresSingleTime;
  }

  get requiresTimeRange() {
    return this.period == 'van-tot';
  }

  get requiresSingleTime() {
    return ['vanaf', 'bepaald uur', 'stipt uur', 'benaderend uur'].includes(this.period);
  }

  get isValid() {
    if (isBlank(this.period)) {
      return false;
    } else if (this.requiresSingleTime && isBlank(this.fromHour)) {
      return false;
    } else if (this.requiresTimeRange && (isBlank(this.fromHour) || isBlank(this.untilHour))) {
      return false;
    } else {
      return true;
    }
  }

  toSubjectString() {
    if (['GD', 'VM', 'NM'].includes(this.period)) {
      return this.period;
    } else if (this.period == 'vanaf') {
      return `vanaf ${this.fromHour} uur`;
    } else if (this.period == 'benaderend uur') {
      return `rond ${this.fromHour} uur`;
    } else if (this.period == 'stipt uur') {
      return `${this.fromHour} uur (stipt)`;
    } else if (this.period == 'bepaald uur') {
      return `${this.fromHour} uur`;
    } else if (this.period == 'van-tot') {
      return `${this.fromHour}-${this.untilHour}`;
    } else {
      return '';
    }
  }

  static parse(subject) {
    const calendarPeriod = new CalendarPeriod();
    const match = subject.match(periodRegex);
    if (match) {
      const timeSpec = match[0];
      if (match[1]) {
        calendarPeriod.period = 'vanaf';
        calendarPeriod.fromHour = match[1].trim();
      } else if (match[2]) {
        calendarPeriod.period = 'benaderend uur';
        calendarPeriod.fromHour = match[2].trim();
      } else if (match[3]) {
        if (match[4]) {
          calendarPeriod.period = 'stipt uur';
        } else {
          calendarPeriod.period = 'bepaald uur';
        }
        calendarPeriod.fromHour = match[3].trim();
      } else if (match[5]) {
        calendarPeriod.period = 'van-tot';
        calendarPeriod.fromHour = match[5].trim();
        calendarPeriod.untilHour = match[6].trim();
      } else {
        calendarPeriod.period = timeSpec; // case 'VM', 'NM', 'GD'
      }
    }
    return calendarPeriod;
  }
}

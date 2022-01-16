import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class CalendarEventModel extends ValidatedModel {
  validators = {
    visitDate: new Validator('presence', {
      presence: true,
    }),
    period: new Validator('presence', {
      presence: true,
    }),
    fromHour: new Validator('inline', {
      validate(value, options, model /*, attribute*/) {
        if (
          ['vanaf', 'bepaald uur', 'stipt uur', 'benaderend uur', 'van-tot'].includes(model.period)
        ) {
          return value ? true : 'Tijdstip is verplicht';
        } else {
          return value ? 'Tijdstip verboden' : true;
        }
      },
    }),
    untilHour: new Validator('inline', {
      validate(value, options, model /*, attribute*/) {
        if (model.period == 'van-tot') {
          return value ? true : 'Tijdstip is verplicht';
        } else {
          return value ? 'Tijdstip verboden' : true;
        }
      },
    }),
  };

  @attr('date-midnight') visitDate;
  @attr period;
  @attr fromHour;
  @attr untilHour;
  @attr comment;
  @attr calendarSubject;
  @attr calendarId;
  @attr msObjectId;

  @belongsTo('request') request;

  get isMastered() {
    return this.msObjectId != null;
  }

  get isMasteredByAccess() {
    return this.calendarId != null;
  }
}

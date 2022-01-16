import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class PlanningEventModel extends ValidatedModel {
  validators = {
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

  @attr('date-midnight') date;
  @attr msObjectId;
  @attr subject;
  @attr period;
  @attr fromHour;
  @attr untilHour;
  @attr('boolean') isNotAvailableInCalendar;

  @belongsTo('intervention') intervention;

  get isPlanned() {
    return this.msObjectId != null;
  }
}

import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  period: validator('inline', {
    validate(value, options, model /*, attribute*/) {
      if (model.date) {
        return value ? true : 'Periode is verplicht';
      } else {
        return value ? 'Periode verboden' : true;
      }
    },
  }),
  fromHour: validator('inline', {
    validate(value, options, model /*, attribute*/) {
      if (
        model.period == 'vanaf' ||
        model.period == 'bepaald uur' ||
        model.period == 'stipt uur' ||
        model.period == 'benaderend uur' ||
        model.period == 'van-tot'
      )
        return value ? true : 'Tijdstip is verplicht';
      else return value ? 'Tijdstip verboden' : true;
    },
  }),
  untilHour: validator('inline', {
    validate(value, options, model /*, attribute*/) {
      if (model.period == 'van-tot') {
        return value ? true : 'Tijdstip is verplicht';
      } else {
        return value ? 'Tijdstip verboden' : true;
      }
    },
  }),
});

export default class PlanningEventModel extends Model.extend(Validations) {
  @attr('date-midnight') date;
  @attr msObjectId;
  @attr subject;
  @attr period;
  @attr fromHour;
  @attr untilHour;
  @attr('boolean') isNotAvailableInCalendar;

  @belongsTo('intervention') intervention;

  @dateString('date') dateStr;

  get isPlanned() {
    return this.msObjectId != null;
  }
}

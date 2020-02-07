import Model, { attr, belongsTo } from '@ember-data/model';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  visitDate: validator('presence', true),
  period: validator('presence', true),
  fromHour: validator('inline', {
    validate(value, options, model/*, attribute*/) {
      if (model.period == 'vanaf' || model.period == 'bepaald uur' || model.period == 'stipt uur'
          || model.period == 'benaderend uur' || model.period == 'van-tot')
        return value ? true : 'Tijdstip is verplicht';
      else
        return value ? 'Tijdstip verboden' : true;
    }
  }),
  untilHour: validator('inline', {
    validate(value, options, model/*, attribute*/) {
      if (model.period == 'van-tot')
        return value ? true : 'Tijdstip is verplicht';
      else
        return value ? 'Tijdstip verboden' : true;
    }
  })
});

export default class CalendarEventModel extends Model.extend(Validations, LoadableModel) {
  @attr('date-midnight') visitDate
  @attr period
  @attr fromHour
  @attr untilHour
  @attr comment
  @attr calendarSubject
  @attr calendarId
  @attr msObjectId

  @belongsTo('request') request

  @dateString('visitDate') visitDateStr

  get isMastered() {
    return this.msObjectId != null;
  }

  get isMasteredByAccess() {
    return this.calendarId != null;
  }
}

import DS from 'ember-data';
import { bool } from '@ember/object/computed';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  visitDate: validator('presence', true),
  period: validator('presence', true),
  fromHour: validator('inline', {
    validate(value, options, model, attribute) {
      if (model.period == 'vanaf' || model.period == 'bepaald uur' || model.period == 'stipt uur'
          || model.period == 'benaderend uur' || model.period == 'van-tot')
        return value ? true : 'Tijdstip is verplicht';
      else
        return value ? 'Tijdstip verboden' : true;
    }
  }),
  untilHour: validator('inline', {
    validate(value, options, model, attribute) {
      if (model.period == 'van-tot')
        return value ? true : 'Tijdstip is verplicht';
      else
        return value ? 'Tijdstip verboden' : true;
    }
  })
});

export default DS.Model.extend(Validations, {
  visitDate: DS.attr('date'),
  period: DS.attr(),
  fromHour: DS.attr(),
  untilHour: DS.attr(),
  visitor: DS.attr(),
  offerExpected: DS.attr(),
  comment: DS.attr(),
  calendarSubject: DS.attr(),
  calendarId: DS.attr(),
  msObjectId: DS.attr(),

  request: DS.belongsTo('request'),

  visitDateStr: dateString('visitDate'),
  isMastered: bool('msObjectId'),
  isMasteredByAccess: bool('calendarId')
});

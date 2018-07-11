import DS from 'ember-data';
import { bool } from '@ember/object/computed';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  visitDate: validator('presence', true)
});

export default DS.Model.extend(Validations, {
  visitDate: DS.attr('date'),
  period: DS.attr(),
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

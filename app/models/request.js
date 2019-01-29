import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  requestDate: validator('presence', true)
});

export default DS.Model.extend(Validations, {
  requestDate: DS.attr('date'),
  requiresVisit: DS.attr(),
  comment: DS.attr(),
  employee: DS.attr(),
  visitor: DS.attr(),
  offerExpected: DS.attr(),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),
  wayOfEntry: DS.belongsTo('way-of-entry'),
  calendarEvent: DS.belongsTo('calendar-event'),
  offer: DS.belongsTo('offer'),

  requestDateStr: dateString('requestDate')
});

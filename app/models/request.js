import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  requestDate: validator('presence', true),
});

export default class RequestModel extends Model.extend(Validations) {
  @attr('date-midnight') requestDate;
  @attr requiresVisit;
  @attr comment;
  @attr employee;
  @attr visitor;
  @attr offerExpected;

  @belongsTo('customer') customer;
  @belongsTo('contact') contact;
  @belongsTo('building') building;
  @belongsTo('way-of-entry') wayOfEntry;
  @belongsTo('calendar-event') calendarEvent;
  @belongsTo('offer') offer;
  @belongsTo('intervention') origin;
}

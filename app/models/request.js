import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class RequestModel extends ValidatedModel {
  validators = {
    requestDate: new Validator('presence', {
      presence: true,
    }),
  };

  @attr('date-midnight') requestDate;
  @attr requiresVisit;
  @attr comment;
  @attr employee;
  @attr visitor;

  @belongsTo('customer') customer;
  @belongsTo('contact') contact;
  @belongsTo('building') building;
  @belongsTo('way-of-entry') wayOfEntry;
  // TODO enable once request is converted to triplestore
  // @belongsTo('calendar-event') calendarEvent;
  @belongsTo('offer') offer;
  @belongsTo('intervention') origin;

  get uri() {
    return `http://data.rollvolet.be/requests/${this.id}`;
  }
}

import { attr, belongsTo, hasMany } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class InterventionModel extends ValidatedModel {
  validators = {
    date: new Validator('presence', {
      presence: true,
    }),
    nbOfPersons: new Validator('number', {
      allowBlank: true,
      positive: true,
    }),
  };

  @attr('date-midnight') date;
  @attr description;
  @attr comment;
  @attr('number') nbOfPersons;
  @attr('date-midnight') cancellationDate;
  @attr cancellationReason;

  @belongsTo('customer') customer;
  @belongsTo('contact') contact;
  @belongsTo('building') building;
  @belongsTo('way-of-entry') wayOfEntry;
  @belongsTo('invoice') invoice;
  @belongsTo('order') origin;
  @belongsTo('request') followUpRequest;
  @belongsTo('planning-event') planningEvent;
  @belongsTo('employee', { inverse: null }) employee;
  @hasMany('employee', { inverse: null }) technicians;

  get isCancelled() {
    return this.cancellationDate;
  }
}

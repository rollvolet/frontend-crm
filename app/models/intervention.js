import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  date: validator('presence', true),
  nbOfPersons: validator('number', {
    allowBlank: true,
    positive: true,
  }),
});

export default class InterventionModel extends Model.extend(Validations, LoadableModel) {
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

  @dateString('date') dateStr;
  @dateString('cancellationDate') cancellationDateStr;

  get isCancelled() {
    return this.cancellationDate;
  }
}

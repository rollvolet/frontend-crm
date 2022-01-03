import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  offerlines: validator('has-many'),
  offerDate: validator('presence', true),
});

export default class OfferModel extends Model.extend(Validations) {
  @attr number;
  @attr sequenceNumber;
  @attr requestNumber;
  @attr('date-midnight') offerDate;
  @attr amount;
  @attr reference;
  @attr comment;
  @attr documentIntro;
  @attr documentOutro;
  @attr documentVersion;

  @belongsTo('request') request;
  @belongsTo('order') order;
  @belongsTo('customer') customer;
  @belongsTo('contact') contact;
  @belongsTo('building') building;
  @belongsTo('vat-rate') vatRate;
  @hasMany('offerline') offerlines;

  // @hasMany('offerline') offerlines;

  get isMasteredByAccess() {
    return this.amount;
  }
}

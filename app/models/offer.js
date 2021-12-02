import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

const Validations = buildValidations({
  offerlines: validator('has-many'),
  offerDate: validator('presence', true),
});

export default class OfferModel extends Model.extend(Validations, LoadableModel) {
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

  @dateString('offerDate') offerDateStr;

  get isMasteredByAccess() {
    return this.amount;
  }
}

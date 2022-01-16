import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class OfferModel extends ValidatedModel {
  validators = {
    offerDate: new Validator('presence', {
      presence: true,
    }),
  };

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
  // @hasMany('offerline') offerlines;

  get isMasteredByAccess() {
    return this.amount;
  }

  get url() {
    return `http://data.rollvolet.be/offers/${this.id}`;
  }
}

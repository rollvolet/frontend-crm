import { attr, belongsTo, hasMany } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class OfferlineModel extends ValidatedModel {
  validators = {
    amount: new Validator('presence', {
      presence: true,
    }),
    currency: new Validator('presence', {
      presence: true,
    }),
    vatRate: new Validator('presence', {
      presence: true,
    }),
  };

  @attr sequenceNumber;
  @attr('string', {
    defaultValue() {
      return 'EUR';
    },
  })
  currency;
  @attr description;
  @attr('number') amount;
  @attr offer;

  @belongsTo('vat-rate') vatRate;
  // @belongsTo('offer') offer;

  @hasMany('calculation-line') calculationLines;

  get arithmeticAmount() {
    return this.amount;
  }
}

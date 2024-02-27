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

  @attr position;
  @attr('string', {
    defaultValue() {
      return 'EUR';
    },
  })
  currency;
  @attr description;
  @attr('number') amount;

  @belongsTo('vat-rate', { inverse: 'offerlines', async: true }) vatRate;
  @belongsTo('offer', { inverse: 'offerlines', async: true }) offer;

  @hasMany('calculation-line', { inverse: 'offerline', async: true }) calculationLines;

  get arithmeticAmount() {
    return this.amount;
  }
}

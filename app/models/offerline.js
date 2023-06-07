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
    // Enable validation once https://github.com/offirgolan/ember-cp-validations/issues/651 is fixed
    // vatRate: new Validator('presence', { presence: true })
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

  @belongsTo('vat-rate') vatRate;
  @belongsTo('offer', { inverse: 'offerlines' }) offer;

  @hasMany('calculation-line') calculationLines;

  get arithmeticAmount() {
    return this.amount;
  }
}

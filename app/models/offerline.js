import { attr, belongsTo, hasMany } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';
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
  @attr offer;

  @belongsTo('vat-rate') vatRate;
  // @belongsTo('offer') offer;

  @hasMany('calculation-line') calculationLines;

  // flag to keep track whether the offerline must be opened in editMode
  @tracked initialEditMode = false;

  get arithmeticAmount() {
    return this.amount;
  }
}

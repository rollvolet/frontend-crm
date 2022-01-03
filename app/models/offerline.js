import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  amount: validator('presence', true),
  vatRate: validator('presence', true),
});

export default class OfferlineModel extends Model.extend(Validations) {
  @attr sequenceNumber;
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

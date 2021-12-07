import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  amount: validator('presence', true),
  vatRate: validator('presence', true),
  description: validator('presence', true),
});

export default class OfferlineModel extends Model.extend(Validations) {
  @attr sequenceNumber;
  @attr description;
  @attr('number') amount;

  @belongsTo('vat-rate') vatRate;
  @belongsTo('offer') offer;

  get arithmeticAmount() {
    return this.amount;
  }
}

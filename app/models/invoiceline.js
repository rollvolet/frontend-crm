import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import { tracked } from '@glimmer/tracking';

const Validations = buildValidations({
  amount: validator('presence', true),
  vatRate: validator('presence', true),
  description: validator('presence', true),
});

export default class InvoicelineModel extends Model.extend(Validations) {
  @attr sequenceNumber;
  @attr description;
  @attr('number') amount;

  @belongsTo('vat-rate') vatRate;
  @belongsTo('order') order;
  @belongsTo('invoice') invoice;

  get arithmeticAmount() {
    return this.amount;
  }

  @tracked isSupplement;
}

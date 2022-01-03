import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  paymentDate: validator('presence', true),
  amount: [
    validator('presence', true),
    validator('number', {
      positive: true,
    }),
  ],
});

export default class DepositModel extends Model.extend(Validations) {
  @attr sequenceNumber;
  @attr('number') amount;
  @attr('date-midnight') paymentDate;

  @belongsTo('customer') customer;
  @belongsTo('order') order;
  @belongsTo('invoice') invoice;
  @belongsTo('payment') payment;

  get arithmeticAmount() {
    return this.amount;
  }
}

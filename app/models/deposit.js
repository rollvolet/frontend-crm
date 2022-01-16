import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class DepositModel extends ValidatedModel {
  validators = {
    paymentDate: new Validator('presence', {
      presence: true,
    }),
    amount: [
      new Validator('presence', {
        presence: true,
      }),
      new Validator('number', {
        positive: true,
      }),
    ],
  };

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

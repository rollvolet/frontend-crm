import Model, { attr, belongsTo } from '@ember-data/model';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  paymentDate: validator('presence', true),
  amount: [
    validator('presence', true),
    validator('number', {
      positive: true
    })
  ]
});

export default class DepositModel extends Model.extend(Validations, LoadableModel) {
  @attr sequenceNumber
  @attr('number') amount
  @attr('date-midnight') paymentDate

  @belongsTo('customer') customer
  @belongsTo('order') order
  @belongsTo('invoice') invoice
  @belongsTo('payment') payment

  @dateString('paymentDate') paymentDateStr

  get arithmeticAmount() {
    return this.amount;
  }
}

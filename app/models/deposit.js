import DS from 'ember-data';
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

export default DS.Model.extend(Validations, {
  sequenceNumber: DS.attr(),
  amount: DS.attr('number'),
  paymentDate: DS.attr('date'),
  customer: DS.belongsTo('customer'),
  order: DS.belongsTo('order'),
  invoice: DS.belongsTo('invoice'),
  payment: DS.belongsTo('payment'),

  paymentDateStr: dateString('paymentDate')
});

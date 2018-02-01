import DS from 'ember-data';

export default DS.Model.extend({
  sequenceNumber: DS.attr(),
  amount: DS.attr(),
  paymentDate: DS.attr('date'),
  isDeposit: DS.attr(),
  order: DS.belongsTo('order'),
  payment: DS.belongsTo('payment')
});

import DS from 'ember-data';

export default DS.Model.extend({
  sequenceNumber: DS.attr(),
  amount: DS.attr(),
  paymentDate: DS.attr('date'),
  order: DS.belongsTo('order'),
  invoice: DS.belongsTo('invoice'),
  payment: DS.belongsTo('payment')
});

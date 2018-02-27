import DS from 'ember-data';

export default DS.Model.extend({
  sequenceNumber: DS.attr(),
  nbOfPieces: DS.attr(),
  amount: DS.attr(),
  description: DS.attr(),
  invoice: DS.belongsTo('invoice')
});

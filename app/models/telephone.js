import DS from 'ember-data';

export default DS.Model.extend({
  area: DS.attr(),
  number: DS.attr(),
  memo: DS.attr(),
  order: DS.attr(),
  country: DS.belongsTo('country'),
  customer: DS.belongsTo('customer')
});

import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  customers: DS.hasMany('customer')
});

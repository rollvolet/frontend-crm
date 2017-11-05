import DS from 'ember-data';

export default DS.Model.extend({
  code: DS.attr(),
  name: DS.attr(),
  telephones: DS.hasMany('telephone'),
  contacts: DS.hasMany('contact'),
  buildings: DS.hasMany('building'),
  customer: DS.hasMany('customer')
});

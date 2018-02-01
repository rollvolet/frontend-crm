import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  deposits: DS.hasMany('deposit')
});

import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  address1: DS.attr(),
  address2: DS.attr(),
  address3: DS.attr(),
  number: DS.attr(),
  created: DS.attr('date', {
    defaultValue() { return new Date(); }
  }),
  updated: DS.attr('date', {
    defaultValue() { return new Date(); }
  }),
  customer: DS.belongsTo('customer'),
  country: DS.belongsTo('country'),
  language: DS.belongsTo('language'),
  postalCode: DS.belongsTo('postal-code')
});

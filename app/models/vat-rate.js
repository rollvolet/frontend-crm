import DS from 'ember-data';

export default DS.Model.extend({
  code: DS.attr(),
  name: DS.attr(),
  rate: DS.attr(),
  order: DS.attr(),
  offers: DS.hasMany('offer'),
  orders: DS.hasMany('order'),
  invoices: DS.hasMany('invoice')
});

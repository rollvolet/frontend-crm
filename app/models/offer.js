import DS from 'ember-data';

export default DS.Model.extend({
  number: DS.attr(),
  sequenceNumber: DS.attr(),
  offerDate: DS.attr('date'),
  amount: DS.attr(),
  submissionDate: DS.attr('date'),
  foreseenHours: DS.attr(),
  foreseenNbOfPersons: DS.attr(),
  comment: DS.attr(),
  reference: DS.attr(),
  canceled: DS.attr(),
  updated: DS.attr('date', {
    defaultValue() { return new Date(); }
  }),
  request: DS.belongsTo('request'),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),
  vatRate: DS.belongsTo('vat-rate'),
  submissiotType: DS.belongsTo('submission-type'),
  product: DS.belongsTo('product')
});

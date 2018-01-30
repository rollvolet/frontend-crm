import DS from 'ember-data';
import { computed } from '@ember/object';

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
  order: DS.belongsTo('order'),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),
  vatRate: DS.belongsTo('vat-rate'),
  submissionType: DS.belongsTo('submission-type'),
  product: DS.belongsTo('product'),

  foreseenTotal: computed('foreseenHours', 'foreseenNbOfPersons', function() {
    return this.get('foreseenHours') * this.get('foreseenNbOfPersons');
  })
});

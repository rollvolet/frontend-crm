import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  orderDate: DS.attr('date'),
  offerNumber: DS.attr(),
  amount: DS.attr(),
  depositRequired: DS.attr(),
  hasProductionTicket: DS.attr(),
  mustBeInstalled: DS.attr(),
  mustBeDelivered: DS.attr(),
  isReady: DS.attr(),
  expectedDate: DS.attr('date'),
  requiredDate: DS.attr('date'),
  scheduledHours: DS.attr(),
  scheduledNbOfPersons: DS.attr(),
  invoicableHours: DS.attr(),
  invoicableNbOfPersons: DS.attr(),
  comment: DS.attr(),
  canceled: DS.attr(),
  cancellationReason: DS.attr(),
  updated: DS.attr('date', {
    defaultValue() { return new Date(); }
  }),
  offer: DS.belongsTo('offer'),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),

  scheduledTotal: computed('scheduledHours', 'scheduledNbOfPersons', function() {
    return this.get('scheduledHours') * this.get('scheduledNbOfPersons');
  }),
  invoicableTotal: computed('invoicableHours', 'invoicableNbOfPersons', function() {
    return this.get('invoicableHours') * this.get('invoicableNbOfPersons');
  })
});

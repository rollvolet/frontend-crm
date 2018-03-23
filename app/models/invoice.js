import { computed } from '@ember/object';
import DS from 'ember-data';

export default DS.Model.extend({
  number: DS.attr(),
  invoiceDate: DS.attr('date'),
  dueDate: DS.attr('date'),
  bookingDate: DS.attr('date'),
  paymentDate: DS.attr('date'),
  cancellationDate: DS.attr('date'),
  baseAmount: DS.attr(),
  amount: DS.attr(),
  vat: DS.attr(),
  totalAmount: DS.attr(),
  isPaidInCash: DS.attr(),
  certificateRequired: DS.attr(),
  certificateReceived: DS.attr(),
  certificateClosed: DS.attr(),
  isCreditNote: DS.attr(),
  hasProductionTicket: DS.attr(),
  performedHours: DS.attr(),
  performedNbOfPersons: DS.attr(),
  certificateUrl: DS.attr(),
  comment: DS.attr(),
  qualification: DS.attr(),
  reference: DS.attr(),
  updated: DS.attr('date', {
    defaultValue() { return new Date(); }
  }),
  order: DS.belongsTo('order'),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),
  vatRate: DS.belongsTo('vat-rate'),
  supplements: DS.hasMany('invoice-supplement'),
  deposits: DS.hasMany('deposits'),
  depositInvoices: DS.hasMany('deposit-invoices'),

  performedTotal: computed('performedHours', 'performedNbOfPersons', function() {
    return this.get('performedHours') * this.get('performedNbOfPersons');
  })
});

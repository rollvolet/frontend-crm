import DS from 'ember-data';
import { conditional, product } from 'ember-awesome-macros';

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
  isCreditNote: DS.attr(),
  updated: DS.attr('date', {
    defaultValue() { return new Date(); }
  }),
  order: DS.belongsTo('order'),
  invoice: DS.belongsTo('invoice'),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),
  vatRate: DS.belongsTo('vat-rate'),

  arithmeticAmount: conditional('isCreditNote', product('amount', -1), 'amount'),
  arithmeticVat: conditional('isCreditNote', product('vat', -1), 'vat')
});

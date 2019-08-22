import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';
import { and, bool, not, or, isEmpty, notEmpty } from 'ember-awesome-macros';

const Validations = buildValidations({
  invoiceDate: validator('presence', true),
  baseAmount: validator('number', {
    allowBlank: true,
    positive: true
  }),
  vatRate: validator('presence', true)
});

export default DS.Model.extend(Validations, {
  number: DS.attr(),
  invoiceDate: DS.attr('date'),
  dueDate: DS.attr('date'),
  bookingDate: DS.attr('date'),
  paymentDate: DS.attr('date'),
  cancellationDate: DS.attr('date'),
  baseAmount: DS.attr(),
  certificateRequired: DS.attr('boolean'),
  certificateReceived: DS.attr('boolean'),
  certificateClosed: DS.attr('boolean'),
  isCreditNote: DS.attr('boolean'),
  hasProductionTicket: DS.attr('boolean'),
  comment: DS.attr(),
  qualification: DS.attr(),
  reference: DS.attr(),

  order: DS.belongsTo('order'),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),
  vatRate: DS.belongsTo('vat-rate'),
  supplements: DS.hasMany('invoice-supplement'),
  deposits: DS.hasMany('deposit'),
  depositInvoices: DS.hasMany('deposit-invoice'),
  workingHours: DS.hasMany('working-hour'),

  invoiceDateStr: dateString('invoiceDate'),
  dueDateStr: dateString('dueDate'),
  bookingDateStr: dateString('bookingDate'),
  paymentDateStr: dateString('paymentDate'),
  cancellationDateStr: dateString('cancellationDate'),

  isBooked: notEmpty('bookingDate'),
  isIsolated: isEmpty('order.id'),
  isMasteredByAccess: or(
    and(not('isIsolated'), 'order.isMasteredByAccess'),
    and('isIsolated', bool('amount'))
  )
});

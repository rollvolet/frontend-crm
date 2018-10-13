import DS from 'ember-data';
import { conditional, product } from 'ember-awesome-macros';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';
import { computed } from '@ember/object';

const Validations = buildValidations({
  invoiceDate: validator('presence', true),
  baseAmount: [
    validator('presence', true),
    validator('number', {
      positive: true
    })
  ],
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
  certificateUrl: DS.attr(),
  comment: DS.attr(),
  qualification: DS.attr(),
  reference: DS.attr(),

  order: DS.belongsTo('order'),
  invoice: DS.belongsTo('invoice'),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),
  vatRate: DS.belongsTo('vat-rate'),

  invoiceDateStr: dateString('invoiceDate'),
  dueDateStr: dateString('dueDate'),
  bookingDateStr: dateString('bookingDate'),
  paymentDateStr: dateString('paymentDate'),
  cancellationDateStr: dateString('cancellationDate'),
  arithmeticAmount: conditional('isCreditNote', product('baseAmount', -1), 'baseAmount'),
  arithmeticVat: computed('baseAmount', 'creditNote', 'vatRate', async function() {
    const vatRate = await this.vatRate;
    const rate = vatRate.rate / 100;
    const vat = this.baseAmount * rate;
    return this.isCreditNote ? vat * -1 : vat;
  })
});

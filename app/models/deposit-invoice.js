import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';
import { computed } from '@ember/object';
import { alias, notEmpty } from '@ember/object/computed';

const Validations = buildValidations({
  invoiceDate: validator('presence', true),
  baseAmount: [
    validator('presence', true),
    validator('number', {
      positive: true
    })
  ],
  // Enable validation once https://github.com/offirgolan/ember-cp-validations/issues/651 is fixed
  // vatRate: validator('presence', true)
});

export default DS.Model.extend(Validations, {
  number: DS.attr(),
  invoiceDate: DS.attr('date-midnight'),
  dueDate: DS.attr('date-midnight'),
  bookingDate: DS.attr('date-midnight'),
  paymentDate: DS.attr('date-midnight'),
  cancellationDate: DS.attr('date-midnight'),
  baseAmount: DS.attr(),
  certificateRequired: DS.attr('boolean'),
  certificateReceived: DS.attr('boolean'),
  certificateClosed: DS.attr('boolean'),
  comment: DS.attr(),
  qualification: DS.attr(),
  documentOutro: DS.attr(),
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
  arithmeticAmount: alias('baseAmount'),
  arithmeticVat: computed('baseAmount', 'vatRate', async function() {
    const vatRate = await this.vatRate;
    const rate = vatRate.rate / 100;
    const vat = this.baseAmount * rate;
    return vat;
  }),

  isBooked: notEmpty('bookingDate'),
  isMasteredByAccess: alias('order.isMasteredByAccess'),
  bankReference: computed('number', function() {
    const modulo = `${(this.number % 97)}`.padStart(2, '0');
    return `${this.number}${modulo}`.padStart(12, '0');
  })
});

import DS from 'ember-data';
import { product } from 'ember-awesome-macros';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

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
  arithmeticAmount: alias('baseAmount'),
  arithmeticVat: computed('baseAmount', 'vatRate', async function() {
    const vatRate = await this.vatRate;
    const rate = vatRate.rate / 100;
    const vat = this.baseAmount * rate;
    return vat;
  })
});

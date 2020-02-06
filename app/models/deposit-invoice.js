import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

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

export default class InvoiceModel extends Model.extend(Validations, LoadableModel) {
  @attr number
  @attr('date-midnight') invoiceDate
  @attr('date-midnight') dueDate
  @attr('date-midnight') bookingDate
  @attr('date-midnight') paymentDate
  @attr('date-midnight') cancellationDate
  @attr baseAmount
  @attr('boolean') certificateRequired
  @attr('boolean') certificateReceived
  @attr('boolean') certificateClosed
  @attr('boolean') isCreditNote
  @attr comment
  @attr qualification
  @attr documentOutro
  @attr reference

  @belongsTo('order') order
  @belongsTo('invoice') invoice
  @belongsTo('customer') customer
  @belongsTo('contact') contact
  @belongsTo('building') building
  @belongsTo('vat-rate') vatRate

  @dateString('invoiceDate') invoiceDateStr
  @dateString('dueDate') dueDateStr
  @dateString('bookingDate') bookingDateStr
  @dateString('paymentDate') paymentDateStr
  @dateString('cancellationDate') cancellationDateStr

  get arithmeticAmount() {
    return this.baseAmount;
  }

  get arithmeticVat() {
    return (async () => {
      const vatRate = await this.vatRate;
      const rate = vatRate.rate / 100;
      const vat = this.baseAmount * rate;
      return vat;
    })();
  }

  get isBooked() {
    return this.bookingDate != null;
  }

  get bankReference() {
    const modulo = `${(this.number % 97)}`.padStart(2, '0');
    return `${this.number}${modulo}`.padStart(12, '0');
  }

  get isMasteredByAccess() {
    return this.order.get('isMasteredByAccess');
  }
}

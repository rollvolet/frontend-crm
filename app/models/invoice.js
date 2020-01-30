import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

const Validations = buildValidations({
  invoiceDate: validator('presence', true),
  baseAmount: validator('number', {
    allowBlank: true,
    positive: true
  }),
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
  @attr('boolean') hasProductionTicket
  @attr comment
  @attr qualification
  @attr documentOutro
  @attr reference

  @belongsTo('order') order
  @belongsTo('customer') customer
  @belongsTo('contact') contact
  @belongsTo('building') building
  @belongsTo('vat-rate') vatRate
  @hasMany('invoice-supplement') supplements
  @hasMany('deposit') deposits
  @hasMany('deposit-invoice') depositInvoices
  @hasMany('invoiceline') invoicelines
  @hasMany('working-hour') workingHours

  @dateString('invoiceDate') invoiceDateStr
  @dateString('dueDate') dueDateStr
  @dateString('bookingDate') bookingDateStr
  @dateString('paymentDate') paymentDateStr
  @dateString('cancellationDate') cancellationDateStr

  get isIsolated() {
    // TODO can the getter be removed once order is a native ES6 class?
    return this.order.get('id') == null;
  }

  get isBooked() {
    return this.bookingDate != null;
  }

  get bankReference() {
    const modulo = this.number % 97;
    return `${this.number}${modulo}`.padStart(12, '0');
  }

  get isMasteredByAccess() {
    // TODO can the getter be removed once order is a native ES6 class?
    return (!this.isIsolated && this.order.get('isMasteredByAccess'))
      || (this.isIsolated && this.baseAmount);
  }
}

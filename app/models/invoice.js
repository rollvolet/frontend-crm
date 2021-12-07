import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import { dateString } from '../utils/date-string';

const Validations = buildValidations({
  invoiceDate: validator('presence', true),
  baseAmount: validator('number', {
    allowBlank: true,
    positive: true,
  }),
  // Enable validation once https://github.com/offirgolan/ember-cp-validations/issues/651 is fixed
  // vatRate: validator('presence', true)
});

export default class InvoiceModel extends Model.extend(Validations) {
  @attr number;
  @attr('date-midnight') invoiceDate;
  @attr('date-midnight') dueDate;
  @attr('date-midnight') bookingDate;
  @attr('date-midnight') paymentDate;
  @attr('date-midnight') cancellationDate;
  @attr baseAmount;
  @attr('boolean') certificateRequired;
  @attr('boolean') certificateReceived;
  @attr('boolean') certificateClosed;
  @attr('boolean') isCreditNote;
  @attr('boolean') hasProductionTicket;
  @attr comment;
  @attr qualification;
  @attr documentOutro;
  @attr reference;

  @belongsTo('order') order;
  @belongsTo('intervention') intervention;
  @belongsTo('customer') customer;
  @belongsTo('contact') contact;
  @belongsTo('building') building;
  @belongsTo('vat-rate') vatRate;
  @hasMany('invoice-supplement') supplements;
  @hasMany('deposit') deposits;
  @hasMany('deposit-invoice') depositInvoices;
  @hasMany('invoiceline') invoicelines;
  @hasMany('working-hour') workingHours;

  @dateString('invoiceDate') invoiceDateStr;
  @dateString('dueDate') dueDateStr;
  @dateString('bookingDate') bookingDateStr;
  @dateString('paymentDate') paymentDateStr;
  @dateString('cancellationDate') cancellationDateStr;

  get isIsolated() {
    return this.order.get('id') == null && this.intervention.get('id') == null;
  }

  get isBooked() {
    return this.bookingDate != null;
  }

  get isPaid() {
    return this.paymentDate != null;
  }

  get bankReference() {
    const base = this.isCreditNote ? 8000000000 : 0;
    const ref = base + this.number;
    let modulo = `${ref % 97}`.padStart(2, '0');
    if (modulo == '00') modulo = '97';
    return `${ref}${modulo}`.padStart(12, '0');
  }

  get isMasteredByAccess() {
    return (
      (!this.isIsolated && this.order.get('isMasteredByAccess')) ||
      (this.isIsolated && this.baseAmount)
    );
  }
}

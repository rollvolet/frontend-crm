import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  invoiceDate: validator('presence', true),
  baseAmount: [
    validator('presence', true),
    validator('number', {
      positive: true,
    }),
  ],
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
  @attr comment;
  @attr qualification;
  @attr documentOutro;
  @attr reference;

  @belongsTo('order') order;
  @belongsTo('invoice') invoice;
  @belongsTo('customer') customer;
  @belongsTo('contact') contact;
  @belongsTo('building') building;
  @belongsTo('vat-rate') vatRate;

  get arithmeticAmount() {
    return this.isCreditNote ? this.baseAmount * -1.0 : this.baseAmount;
  }

  get isBooked() {
    return this.bookingDate != null;
  }

  get isPaid() {
    return this.paymentDate != null;
  }

  get bankReference() {
    const base = this.isCreditNote ? 8000000000 : 5000000000;
    const ref = base + this.number;
    let modulo = `${ref % 97}`.padStart(2, '0');
    if (modulo == '00') modulo = '97';
    return `${ref}${modulo}`.padStart(12, '0');
  }

  get isMasteredByAccess() {
    return this.order.get('isMasteredByAccess');
  }
}

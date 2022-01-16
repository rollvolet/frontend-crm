import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class DepositInvoiceModel extends ValidatedModel {
  validators = {
    invoiceDate: new Validator('presence', {
      presence: true,
    }),
    baseAmount: [
      new Validator('presence', {
        presence: true,
      }),
      new Validator('number', {
        positive: true,
      }),
    ],
    // Enable validation once https://github.com/offirgolan/ember-cp-validations/issues/651 is fixed
    // vatRate: new Validator('presence', { presence: true })
  };

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
  @attr('string', {
    defaultValue() {
      return 'RKB';
    },
  })
  origin;

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
    return this.origin == 'Access';
  }
}

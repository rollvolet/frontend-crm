import { attr, belongsTo, hasMany } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';
import { INVOICE_TYPES } from '../config/constants';

export default class InvoiceModel extends ValidatedModel {
  validators = {
    invoiceDate: new Validator('presence', {
      presence: true,
    }),
    totalAmountNet: new Validator('number', {
      allowBlank: true,
      positive: true,
    }),
  };

  @attr('string') uri;
  @attr('string') type;
  @attr('number') number;
  @attr('date') invoiceDate;
  @attr('date') dueDate;
  @attr('date') bookingDate;
  @attr('date') paymentDate;
  @attr('date') cancellationDate;
  @attr('string') documentOutro;

  @attr totalAmountNet;
  @attr paymentAmountNet;
  @attr vatAmount;

  @attr('string', {
    defaultValue() {
      return 'EUR';
    },
  })
  currency;
  @attr('string', {
    defaultValue() {
      return 'RKB';
    },
  })
  origin;

  @belongsTo('case', { inverse: 'invoices' }) case;
  @belongsTo('customer-snapshot', { inverse: 'invoice' }) customer;
  @belongsTo('contact-snapshot', { inverse: 'invoice' }) contact;
  @belongsTo('building-snapshot', { inverse: 'invoice' }) building;

  @hasMany('invoiceline', { inverse: 'invoice' }) invoicelines;
  @hasMany('technical-work-activity', { inverse: 'invoice' }) technicalWorkActivities;

  get isBooked() {
    return this.bookingDate != null;
  }

  get isPaid() {
    return this.paymentDate != null;
  }

  get isCreditNote() {
    return this.type == INVOICE_TYPES.CREDIT_NOTE;
  }

  get arithmeticAmount() {
    return this.isCreditNote ? this.totalAmountNet * -1.0 : this.totalAmountNet;
  }

  get bankReference() {
    const base = this.isCreditNote ? 8000000000 : 0;
    const ref = base + this.number;
    let modulo = `${ref % 97}`.padStart(2, '0');
    if (modulo == '00') modulo = '97';
    return `${ref}${modulo}`.padStart(12, '0');
  }

  get isMasteredByAccess() {
    return this.origin == 'Access';
  }
}

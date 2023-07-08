import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';
import constants from '../config/constants';

const { INVOICE_TYPES } = constants;

export default class InvoiceDocumentModel extends ValidatedModel {
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
  @attr('string') documentOutro;
  @attr('boolean') certificateRequired;
  @attr('boolean') certificateReceived;

  @attr totalAmountNet;
  // TODO remove? can be calculated ad hoc?
  // @attr paymentAmountNet;
  // @attr vatAmount;

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
  source;

  @belongsTo('customer-snapshot', { inverse: 'invoice' }) customer;
  @belongsTo('contact-snapshot', { inverse: 'invoice' }) contact;
  @belongsTo('building-snapshot', { inverse: 'invoice' }) building;
  @belongsTo('invoice-document', { inverse: 'creditedInvoice', polymorphic: true }) creditNote;
  @belongsTo('invoice-document', { inverse: 'creditNote', polymorphic: true }) creditedInvoice;
  @belongsTo('file', { inverse: 'invoice' }) document;

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
    return this.source == 'Access';
  }
}

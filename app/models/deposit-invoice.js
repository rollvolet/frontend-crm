import { attr, belongsTo } from '@ember-data/model';
import InvoiceDocumentModel from './invoice-document';
import generateBankReference from '../utils/generate-bank-reference';

export default class DepositInvoiceModel extends InvoiceDocumentModel {
  @attr('string') comment;

  @belongsTo('case', { inverse: 'depositInvoices' }) case;

  get bankReference() {
    const base = this.isCreditNote ? 8000000000 : 5000000000;
    return generateBankReference(this.number, base);
  }
}

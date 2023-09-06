import { attr, belongsTo } from '@ember-data/model';
import InvoiceDocumentModel from './invoice-document';

export default class DepositInvoiceModel extends InvoiceDocumentModel {
  @attr('string') comment;

  @belongsTo('case', { inverse: 'depositInvoices' }) case;
}

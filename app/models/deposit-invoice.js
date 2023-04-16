import { belongsTo } from '@ember-data/model';
import InvoiceDocumentModel from './invoice-document';

export default class DepositInvoiceModel extends InvoiceDocumentModel {
  @belongsTo('case', { inverse: 'invoices' }) case;
}

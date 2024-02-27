import { attr, belongsTo, hasMany } from '@ember-data/model';
import InvoiceDocumentModel from './invoice-document';
import generateBankReference from '../utils/generate-bank-reference';

export default class InvoiceModel extends InvoiceDocumentModel {
  @attr('number') paidDeposits;

  @belongsTo('case', { inverse: 'invoice', async: true }) case;

  @hasMany('invoiceline', { inverse: 'invoice', async: true }) invoicelines;
  @hasMany('technical-work-activity', { inverse: 'invoice', async: true }) technicalWorkActivities;

  get bankReference() {
    const base = this.isCreditNote ? 8000000000 : 0;
    return generateBankReference(this.number, base);
  }
}

import { attr, belongsTo, hasMany } from '@ember-data/model';
import InvoiceDocumentModel from './invoice-document';

export default class InvoiceModel extends InvoiceDocumentModel {
  @attr('number') paidDeposits;

  @belongsTo('case', { inverse: 'invoice' }) case;

  @hasMany('invoiceline', { inverse: 'invoice' }) invoicelines;
  @hasMany('technical-work-activity', { inverse: 'invoice' }) technicalWorkActivities;
}

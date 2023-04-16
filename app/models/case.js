import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class CaseModel extends Model {
  @attr('string') uri;
  @attr('string') identifier;
  @attr('string') reference;
  @attr('string') comment;
  @attr('boolean') hasProductionTicket;

  @attr customer;
  // @belongsTo('customer') customer;
  @attr contact;
  // @belongsTo('contact') contact;
  @attr building;
  // @belongsTo('building') building;

  @attr request;
  // @belongsTo('request') request;
  @attr intervention;
  // @belongsTo('intervention') intervention;
  @attr offer;
  // @belongsTo('offer') offer;
  @attr order;
  // @belongsTo('order') order;

  @belongsTo('vat-rate', { inverse: 'cases' }) vatRate;
  @hasMany('deposit-invoice', { inverse: 'case' }) depositInvoices;
  @belongsTo('invoice', { inverse: 'case' }) invoice;
  @hasMany('file') attachments;

  get isIsolated() {
    return this.order == null && this.intervention == null;
  }
}

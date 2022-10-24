import Model, { attr, hasMany } from '@ember-data/model';

export default class CaseModel extends Model {
  @attr uri;
  @attr identifier;
  @attr reference;
  @attr comment;

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
  // @attr('uri-set') depositInvoices;
  // @hasMany('deposit-invoice') depositInvoices;
  @attr invoice;
  // @belongsTo('invoice') invoice;

  // @belongsTo('vat-rate') vatRate;
  @hasMany('file') attachments;
}

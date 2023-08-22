import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import constants from '../config/constants';

const { CASE_STATUSES } = constants;

export default class CaseModel extends Model {
  @attr('string') uri;
  @attr('string') identifier;
  @attr('string', {
    defaultValue() {
      return CASE_STATUSES.ONGOING;
    },
  }) status;
  @attr('string') reference;
  @attr('string') comment;
  @attr('boolean') hasProductionTicket;

  @belongsTo('customer', { inverse: 'cases' }) customer;
  @belongsTo('contact', { inverse: 'cases' }) contact;
  @belongsTo('building', { inverse: 'cases' }) building;
  @belongsTo('concept', { inverse: null }) deliveryMethod;
  @belongsTo('activity', { inverse: 'case' }) invalidation;
  @belongsTo('vat-rate', { inverse: 'cases' }) vatRate;
  @hasMany('file', { inverse: 'case' }) attachments;
  @belongsTo('intervention', { inverse: 'case' }) intervention;
  @belongsTo('request', { inverse: 'case' }) request;
  @belongsTo('offer', { inverse: 'case' }) offer;
  @belongsTo('order', { inverse: 'case' }) order;
  @hasMany('deposit-invoice', { inverse: 'case' }) depositInvoices;
  @belongsTo('invoice', { inverse: 'case' }) invoice;

  get isIsolated() {
    return this.identifier?.startsWith('F-');
  }

  get isOngoing() {
    return this.status == CASE_STATUSES.ONGOING;
  }

  get isCancelled() {
    return this.status == CASE_STATUSES.CANCELLED;
  }
}

import { attr, belongsTo, hasMany } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';
import constants from '../config/constants';
const { CASE_STATUSES } = constants;

export default class CaseModel extends ValidatedModel {
  validators = {
    identifier: new Validator('presence', {
      presence: true,
    }),
    status: new Validator('presence', {
      presence: true,
    }),
  };

  @attr('string') uri;
  @attr('string') identifier;
  @attr('string', {
    defaultValue() {
      return CASE_STATUSES.ONGOING;
    },
  })
  status;
  @attr('string') reference;
  @attr('string') comment;
  @attr('boolean') hasProductionTicket;
  @attr('boolean') depositRequired;

  @belongsTo('structured-identifier', { inverse: 'case', async: true }) structuredIdentifier;
  @belongsTo('customer', { inverse: 'cases', async: true }) customer;
  @belongsTo('contact', { inverse: 'cases', async: true }) contact;
  @belongsTo('building', { inverse: 'cases', async: true }) building;
  @belongsTo('concept', { inverse: null, async: true }) deliveryMethod;
  @belongsTo('activity', { inverse: 'case', async: true }) invalidation;
  @belongsTo('vat-rate', { inverse: 'cases', async: true }) vatRate;
  @hasMany('file', { inverse: 'case', async: true }) attachments;
  @belongsTo('intervention', { inverse: 'case', async: true }) intervention;
  @belongsTo('request', { inverse: 'case', async: true }) request;
  @belongsTo('offer', { inverse: 'case', async: true }) offer;
  @belongsTo('order', { inverse: 'case', async: true }) order;
  @hasMany('deposit-invoice', { inverse: 'case', async: true }) depositInvoices;
  @belongsTo('invoice', { inverse: 'case', async: true }) invoice;

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

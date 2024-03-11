import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel from './validated-model';

export default class CustomerProfileModel extends ValidatedModel {
  @attr('string') uri;
  @attr('number') invoicePaymentPeriod;
  @attr('boolean') depositRequired;

  @belongsTo('customer', { inverse: 'profile', async: true }) customer;
  @belongsTo('vat-rate', { inverse: null, async: true }) vatRate;
  @belongsTo('concept', { inverse: null, async: true }) deliveryMethod;
}

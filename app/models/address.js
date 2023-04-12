import Model, { attr, belongsTo } from '@ember-data/model';

export default class AddressModel extends Model {
  @attr('string') street;
  @attr('string') postalCode;
  @attr('string') city;

  @belongsTo('country', { inverse: 'addresses' }) country;
  @belongsTo('customer-snapshot', { inverse: 'address' }) customerSnapshot;
  @belongsTo('contact-snapshot', { inverse: 'address' }) contactSnapshot;
  @belongsTo('building-snapshot', { inverse: 'address' }) buildingSnapshot;
}

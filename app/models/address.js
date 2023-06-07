import { attr, belongsTo } from '@ember-data/model';
import { isPresent } from '@ember/utils';
import ValidatedModel, { Validator } from './validated-model';

export default class AddressModel extends ValidatedModel {
  validators = {
    country: new Validator('presence', {
      presence: true,
      message: 'Kies een geldig land',
    }),
  };

  @attr('string') street;
  @attr('string') postalCode;
  @attr('string') city;

  @belongsTo('country', { inverse: 'addresses' }) country;
  @belongsTo('customer', { inverse: 'address' }) customer;
  @belongsTo('customer-snapshot', { inverse: 'address' }) customerSnapshot;
  @belongsTo('contact', { inverse: 'address' }) contact;
  @belongsTo('contact-snapshot', { inverse: 'address' }) contactSnapshot;
  @belongsTo('building', { inverse: 'address' }) building;
  @belongsTo('building-snapshot', { inverse: 'address' }) buildingSnapshot;

  get fullAddress() {
    return [this.address, `${this.postalCode || ''} ${this.city || ''}`]
      .filter((line) => isPresent(line))
      .join(', ');
  }
}

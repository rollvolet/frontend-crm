import { attr, belongsTo } from '@ember-data/model';
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

  @belongsTo('country', { inverse: 'addresses', async: true }) country;
  @belongsTo('customer', { inverse: 'address', async: true }) customer;
  @belongsTo('customer-snapshot', { inverse: 'address', async: true }) customerSnapshot;
  @belongsTo('contact', { inverse: 'address', async: true }) contact;
  @belongsTo('contact-snapshot', { inverse: 'address', async: true }) contactSnapshot;
  @belongsTo('building', { inverse: 'address', async: true }) building;
  @belongsTo('building-snapshot', { inverse: 'address', async: true }) buildingSnapshot;
}

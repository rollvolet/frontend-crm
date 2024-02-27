import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class TelephoneModel extends ValidatedModel {
  validators = {
    country: new Validator('presence', {
      presence: true,
      message: 'Maak een keuze',
    }),
  };

  @attr('string') value;
  @attr('number') position;
  @attr('string') note;

  @belongsTo('country', { inverse: 'telephones', async: true }) country;
  @belongsTo('telephone-type', { inverse: 'telephones', async: true }) telephoneType;
  @belongsTo('customer', { inverse: 'telephones', async: true }) customer;
  @belongsTo('contact', { inverse: 'telephones', async: true }) contact;
  @belongsTo('building', { inverse: 'telephones', async: true }) building;
}

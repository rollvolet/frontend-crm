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

  @belongsTo('country', { inverse: 'telephones' }) country;
  @belongsTo('telephone-type', { inverse: 'telephones' }) telephoneType;
  @belongsTo('customer', { inverse: 'telephones' }) customer;
  @belongsTo('contact', { inverse: 'telephones' }) contact;
  @belongsTo('building', { inverse: 'telephones' }) building;
}

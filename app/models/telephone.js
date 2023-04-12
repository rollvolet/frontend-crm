import { attr, belongsTo, hasMany } from '@ember-data/model';
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
  // TODO refactor once customers are stored in triplestore
  @attr customer;
  @attr contact;
  @attr building;

  @belongsTo('country') country;
  @belongsTo('telephone-type') telephoneType;

  @hasMany('customer-snapshot', { inverse: 'telephones' }) customerSnapshots;

  // @belongsTo('customer') customer;
  // @belongsTo('contact') contact;
  // @belongsTo('building') building;
}

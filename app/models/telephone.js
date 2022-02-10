import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class TelephoneModel extends ValidatedModel {
  validators = {
    country: new Validator('presence', {
      presence: true,
      message: 'Maak een keuze',
    }),
  };

  @attr value;
  @attr('number') position;
  @attr note;
  // TODO refactor once customers are stored in triplestore
  @attr customer;
  @attr contact;
  @attr building;

  @belongsTo('country') country;
  @belongsTo('telephone-type') telephoneType;

  // @belongsTo('customer') customer;
  // @belongsTo('contact') contact;
  // @belongsTo('building') building;
}

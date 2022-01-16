import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';
import { get } from '@ember/object';

export default class TelephoneModel extends ValidatedModel {
  validators = {
    area: [
      new Validator('presence', {
        presence: true,
      }),
      new Validator('length', {
        min: 2,
        max: 4,
      }),
    ],
    number: [
      new Validator('presence', {
        presence: true,
      }),
      new Validator('length', {
        min: 6,
      }),
    ],
    telephoneType: new Validator('presence', {
      presence: true,
      message: 'Maak een keuze',
    }),
    country: new Validator('presence', {
      presence: true,
      message: 'Maak een keuze',
    }),
  };

  @attr area;
  @attr number;
  @attr memo;
  @attr order;

  @belongsTo('country') country;
  @belongsTo('telephone-type') telephoneType;
  @belongsTo('customer') customer;
  @belongsTo('contact') contact;
  @belongsTo('building') building;

  get isBlank() {
    return !(
      this.area ||
      this.number ||
      this.memo ||
      this.order ||
      get('this.country.id') ||
      get('this.telephoneType.id')
    );
  }

  hasDirtyRelations() {
    let [_, telephoneTypeId, countryId] = this.id.split('-'); // eslint-disable-line no-unused-vars
    return get('this.telephoneType.id') != telephoneTypeId || get('this.country.id') != countryId;
  }
}

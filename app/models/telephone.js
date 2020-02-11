import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  area: [
    validator('presence', true),
    validator('length', {
      min: 2,
      max: 4
    })
  ],
  number: [
    validator('presence', true),
    validator('length', {
      min: 6
    })
  ],
  telephoneType: validator('presence', {
    presence: true,
    message: 'Maak een keuze'
  }),
  country:  validator('presence', {
    presence: true,
    message: 'Maak een keuze'
  })
});

export default class Telephone extends Model.extend(Validations) {
  @attr area
  @attr number
  @attr memo
  @attr order

  @belongsTo('country') country
  @belongsTo('telephone-type') telephoneType
  @belongsTo('customer') customer
  @belongsTo('contact') contact
  @belongsTo('building') building

  get isBlank() {
    return !(this.area || this.number || this.memo || this.order || this.get('country.id') || this.get('telephoneType.id'));
  }

  hasDirtyRelations() {
    let [_, telephoneTypeId, countryId] = this.id.split('-'); // eslint-disable-line no-unused-vars
    return this.get('telephoneType.id') != telephoneTypeId || this.get('country.id') != countryId;
  }
}

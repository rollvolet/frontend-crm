import DS from 'ember-data';
import { computed } from '@ember/object';
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

export default DS.Model.extend(Validations, {
  area: DS.attr(),
  number: DS.attr(),
  memo: DS.attr(),
  order: DS.attr(),
  country: DS.belongsTo('country'),
  telephoneType: DS.belongsTo('telephone-type'),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),

  isBlank: computed('area', 'number', 'memo', 'order', 'country', 'telephoneType',  function() {
    return !(this.area || this.number || this.memo || this.order || this.get('country.id') || this.get('telephoneType.id'));
  }),

  hasDirtyRelations() {
    let [_, telephoneTypeId, countryId] = this.id.split('-'); // eslint-disable-line no-unused-vars
    return this.get('telephoneType.id') != telephoneTypeId || this.get('country.id') != countryId;
  }
});

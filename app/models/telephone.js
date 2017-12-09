import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  area: DS.attr(),
  number: DS.attr(),
  memo: DS.attr(),
  order: DS.attr(),
  country: DS.belongsTo('country'),
  telephoneType: DS.belongsTo('telephone-type'),
  customer: DS.belongsTo('customer'),
  contact: DS.belongsTo('contact'),
  building: DS.belongsTo('building'),

  fullNumber: computed('area', 'number', function() {
    return `${this.get('area')} ${this.get('number')}`;
  })
});

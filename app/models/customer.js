import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  dataId: DS.attr(),
  number: DS.attr(),
  name: DS.attr(),
  address1: DS.attr(),
  address2: DS.attr(),
  address3: DS.attr(),
  isCompany: DS.attr(),
  vatNumber: DS.attr(),
  prefix: DS.attr(),
  suffix: DS.attr(),
  email: DS.attr(),
  email2: DS.attr(),
  url: DS.attr(),
  printPrefix: DS.attr(),
  printSuffix: DS.attr(),
  printInFront: DS.attr(),
  comment: DS.attr(),
  created: DS.attr('date', {
    defaultValue() { return new Date(); }
  }),
  updated: DS.attr('date', {
    defaultValue() { return new Date(); }
  }),
  contacts: DS.hasMany('contact'),
  buildings: DS.hasMany('building'),
  country: DS.belongsTo('country'),
  language: DS.belongsTo('language'),
  postalCode: DS.belongsTo('postal-code'),
  honorificPrefix: DS.belongsTo('honorific-prefix'),
  telephones: DS.hasMany('telephone'),

  address: computed('address1', 'address2', 'address3', function() {
    return `${this.get('address1')} ${this.get('address2')} ${this.get('address3')}`.trim();
  })
});

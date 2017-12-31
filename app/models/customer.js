import DS from 'ember-data';
import { computed } from '@ember/object';
import HasManyQuery from 'ember-data-has-many-query';

export default DS.Model.extend(HasManyQuery.ModelMixin, {
  dataId: DS.attr(),
  number: DS.attr(),
  name: DS.attr(),
  address1: DS.attr(),
  address2: DS.attr(),
  address3: DS.attr(),
  postalCode: DS.attr(),
  city: DS.attr(),
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
  memo: DS.attr(),
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
  honorificPrefix: DS.belongsTo('honorific-prefix'),
  telephones: DS.hasMany('telephone'),
  requests: DS.hasMany('request'),
  tags: DS.hasMany('tag'),

  printName: computed('printPrefix', 'prefix', 'printSuffix', 'suffix', 'name', function() {
    var name = '';
    if (this.get('printPrefix') && this.get('prefix')) { name += this.get('prefix') + ' '; }
    name += this.get('name') + ' ';
    if (this.get('printSuffix') && this.get('suffix')) { name += this.get('suffix'); }
    return name.trim();
  }),
  address: computed('address1', 'address2', 'address3', function() {
    var address = '';
    if (this.get('address1')) { address += this.get('address1') + ' '; }
    if (this.get('address2')) { address += this.get('address2') + ' '; }
    if (this.get('address3')) { address += this.get('address3') + ' '; }
    return address.trim();
  })
});

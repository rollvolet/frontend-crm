import DS from 'ember-data';
import { computed } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  email: validator('format', { type: 'email', allowBlank: true }),
  email2: validator('format', { type: 'email', allowBlank: true }),
  url: validator('format', { type: 'url', allowBlank: true }),
  language: validator('presence', true),
  country: validator('presence', true)
});

export default DS.Model.extend(Validations, {
  name: DS.attr(),
  address1: DS.attr(),
  address2: DS.attr(),
  address3: DS.attr(),
  postalCode: DS.attr(),
  city: DS.attr(),
  prefix: DS.attr(),
  suffix: DS.attr(),
  email: DS.attr(),
  email2: DS.attr(),
  url: DS.attr(),
  printPrefix: DS.attr(),
  printSuffix: DS.attr(),
  printInFront: DS.attr(),
  comment: DS.attr(),
  number: DS.attr(),
  created: DS.attr('date', {
    defaultValue() { return new Date(); }
  }),
  customer: DS.belongsTo('customer'),
  country: DS.belongsTo('country'),
  language: DS.belongsTo('language'),
  honorificPrefix: DS.belongsTo('honorific-prefix'),
  telephones: DS.hasMany('telephone'),
  requests: DS.hasMany('request'),
  offers: DS.hasMany('offer'),
  orders: DS.hasMany('order'),

  printName: computed('prefix', 'name', function() {
    let name = '';
    if (this.printPrefix && this.prefix) { name += this.prefix + ' '; }
    name += this.name || '';
    if (this.printSuffix && this.suffix) { name += ' ' + this.suffix; }
    return name.trim();
  }),
  searchName: computed('printName', 'number', 'city', 'postalCode', 'address', function() {
    let search = `[${this.number}] ${this.printName}`;
    if (this.postalCode || this.city || this.address) {
      const fullAddress = `${this.address} ${this.postalCode} ${this.city}`;
      search += ` (${fullAddress.trim()})`;
    }
    return search;
  }),
  address: computed('address1', 'address2', 'address3', function() {
    var address = '';
    if (this.address1) { address += this.address1 + ' '; }
    if (this.address2) { address += this.address2 + ' '; }
    if (this.address3) { address += this.address3 + ' '; }
    return address.trim();
  })
});

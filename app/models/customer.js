import DS from 'ember-data';
import HasManyQuery from 'ember-data-has-many-query';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  email: validator('format', { type: 'email', allowBlank: true }),
  email2: validator('format', { type: 'email', allowBlank: true }),
  url: validator('format', { type: 'url', allowBlank: true }),
  // TODO add VAT number validation
  language: validator('presence', true),
  country: validator('presence', true)
});

export default DS.Model.extend(Validations, HasManyQuery.ModelMixin, {
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
  contacts: DS.hasMany('contact'),
  buildings: DS.hasMany('building'),
  country: DS.belongsTo('country'),
  language: DS.belongsTo('language'),
  honorificPrefix: DS.belongsTo('honorific-prefix'),
  telephones: DS.hasMany('telephone'),
  requests: DS.hasMany('request'),
  offers: DS.hasMany('offer'),
  orders: DS.hasMany('order'),
  depositInvoices: DS.hasMany('deposit-invoice'),
  invoices: DS.hasMany('invoice'),
  tags: DS.hasMany('tag')
});

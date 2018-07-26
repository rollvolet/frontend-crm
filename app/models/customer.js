import DS from 'ember-data';
import HasManyQuery from 'ember-data-has-many-query';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  email: validator('format', { type: 'email', allowBlank: true }),
  email2: validator('format', { type: 'email', allowBlank: true }),
  url: validator('format', { type: 'url', allowBlank: true }),
  // TODO add VAT number validation
  language: validator('presence', {
    presence: true,
    message: 'Kies een geldige taal'
  }),
  country: validator('presence', {
    presence: true,
    message: 'Kies een geldig land'
  }),
  vatNumber: validator('inline', {
    validate(value/*, options, model, attribute*/) {
      if (value && value.length >= 2) {
        const country = value.substr(0, 2);
        if (country.toUpperCase() == 'BE') {
          const number = value.substr(2);

          if (number.length != 10)
            return 'BTW nummer moet exact 10 cijfers bevatten';

          const firstPart = parseInt(number.substr(0, 8));
          const secondPart = parseInt(number.substr(8));
          const modulo = firstPart % 97;

          if (secondPart + modulo != 97)
            return 'Ongeldig BTW nummer';
        }
      }
      return true;
    }
  })
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
  deposits: DS.hasMany('deposit'),
  depositInvoices: DS.hasMany('deposit-invoice'),
  invoices: DS.hasMany('invoice'),
  tags: DS.hasMany('tag')
});

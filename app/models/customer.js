import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  email: validator('format', { type: 'email', allowBlank: true }),
  email2: validator('format', { type: 'email', allowBlank: true }),
  url: validator('format', { type: 'url', allowBlank: true }),
  language: validator('presence', {
    presence: true,
    message: 'Kies een geldige taal',
  }),
  country: validator('presence', {
    presence: true,
    message: 'Kies een geldig land',
  }),
  vatNumber: [
    validator('inline', {
      validate(value /*, options, model, attribute*/) {
        if (value && value.length >= 2) {
          const country = value.substr(0, 2);
          if (country.toUpperCase() == 'BE') {
            const number = value.substr(2);

            if (number.length != 10) {
              return 'BTW nummer moet exact 10 cijfers bevatten';
            }

            const firstPart = parseInt(number.substr(0, 8));
            const secondPart = parseInt(number.substr(8));
            const modulo = firstPart % 97;

            if (secondPart + modulo != 97)
              return this.createErrorMessage('invalid', value, { description: 'BTW-nummer' });
          }
        }
        return true;
      },
    }),
    validator('unique-vat-number'),
  ],
});

export default class CustomerModel extends Model.extend(Validations) {
  @attr dataId;
  @attr number;
  @attr name;
  @attr address1;
  @attr address2;
  @attr address3;
  @attr postalCode;
  @attr city;
  @attr isCompany;
  @attr vatNumber;
  @attr prefix;
  @attr suffix;
  @attr email;
  @attr email2;
  @attr url;
  @attr printPrefix;
  @attr printSuffix;
  @attr printInFront;
  @attr comment;
  @attr memo;
  @attr('datetime', {
    defaultValue() {
      return new Date();
    },
  })
  created;

  @hasMany('contact') contacts;
  @hasMany('building') buildings;
  @belongsTo('country') country;
  @belongsTo('language') language;
  @belongsTo('honorific-prefix') honorificPrefix;
  @hasMany('telephone') telephones;
  @hasMany('request') requests;
  @hasMany('intervention') interventions;
  @hasMany('offer') offers;
  @hasMany('order') orders;
  @hasMany('deposit') deposits;
  @hasMany('deposit-invoice') depositInvoices;
  @hasMany('invoice') invoices;
  @hasMany('tag') tags;
}

import { attr, belongsTo, hasMany } from '@ember-data/model';
import { getOwner } from '@ember/application';
import { isPresent } from '@ember/utils';
import ValidatedModel, { Validator } from './validated-model';
import UniqueVatNumberValidator from '../validators/unique-vat-number';

export default class CustomerModel extends ValidatedModel {
  validators = {
    email: new Validator('format', { type: 'email', allowBlank: true }),
    email2: new Validator('format', { type: 'email', allowBlank: true }),
    url: new Validator('format', { type: 'url', allowBlank: true }),
    language: new Validator('presence', {
      presence: true,
      message: 'Kies een geldige taal',
    }),
    country: new Validator('presence', {
      presence: true,
      message: 'Kies een geldig land',
    }),
    vatNumber: [
      new Validator('inline', {
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
                return {
                  type: 'invalid',
                  value,
                  context: {
                    description: 'BTW-nummer',
                  },
                };
            }
          }
          return true;
        },
      }),
      new UniqueVatNumberValidator(getOwner(this)),
    ],
  };

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
  // @hasMany('telephone') telephones;
  @hasMany('request') requests;
  @hasMany('intervention') interventions;
  @hasMany('offer') offers;
  @hasMany('order') orders;
  @hasMany('deposit') deposits;
  @hasMany('deposit-invoice') depositInvoices;
  @hasMany('invoice') invoices;
  @hasMany('tag') tags;

  get address() {
    let address = '';
    if (this.address1) {
      address += this.address1 + ' ';
    }
    if (this.address2) {
      address += this.address2 + ' ';
    }
    if (this.address3) {
      address += this.address3 + ' ';
    }
    return address.trim();
  }

  get fullAddress() {
    return [this.address, `${this.postalCode || ''} ${this.city || ''}`]
      .filter((line) => isPresent(line))
      .join(', ');
  }

  get uri() {
    return `http://data.rollvolet.be/customers/${this.dataId}`;
  }
}

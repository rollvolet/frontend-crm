import { attr, belongsTo, hasMany } from '@ember-data/model';
import { getOwner } from '@ember/application';
import ValidatedModel, { Validator } from './validated-model';
import UniqueVatNumberValidator from '../validators/unique-vat-number';
import constants from '../config/constants';

const { CUSTOMER_TYPES } = constants;

export default class CustomerModel extends ValidatedModel {
  validators = {
    url: new Validator('format', { type: 'url', allowBlank: true }),
    language: new Validator('presence', {
      presence: true,
      message: 'Kies een geldige taal',
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

  @attr('string') type; // individual or organization
  @attr('number') number;
  @attr('string') honorificPrefix;
  @attr('string') prefix;
  @attr('string') name;
  @attr('string') suffix;
  @attr('string') url;
  @attr('string') vatNumber;
  @attr('string') comment;
  @attr('string') memo;
  @attr('string-set') tags;
  @attr('datetime', {
    defaultValue() {
      return new Date();
    },
  })
  created;
  @attr('datetime', {
    defaultValue() {
      return new Date();
    },
  })
  modified;
  @attr('boolean') printPrefix;
  @attr('boolean') printSuffix;
  @attr('boolean') printInFront;

  @belongsTo('address', { inverse: 'customer' }) address;
  @belongsTo('language', { inverse: 'customers' }) language;
  @hasMany('telephone', { inverse: 'customer' }) telephones;
  @hasMany('email', { inverse: 'customer' }) emails;
  @hasMany('contact', { inverse: 'customer' }) contacts;
  @hasMany('building', { inverse: 'customer' }) buildings;
  @hasMany('case', { inverse: 'customer' }) cases;
  @hasMany('customer-snapshot', { inverse: 'source' }) snapshots;

  get isCompany() {
    return this.type == CUSTOMER_TYPES.ORGANIZATION;
  }
}

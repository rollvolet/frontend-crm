import { attr, belongsTo, hasMany } from '@ember-data/model';
import { getOwner } from '@ember/application';
import { isPresent } from '@ember/utils';
import ValidatedModel, { Validator } from './validated-model';
import UniqueVatNumberValidator from '../validators/unique-vat-number';
import constants from '../config/constants';

const { CUSTOMER_TYPES, CUSTOMER_STATUSES } = constants;

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

  @attr('string') uri;
  @attr('string', {
    defaultValue() {
      return CUSTOMER_STATUSES.ACTIVE;
    },
  })
  status;
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

  @belongsTo('customer-profile', { inverse: 'customer', async: true }) profile;
  @belongsTo('address', { inverse: 'customer', async: true }) address;
  @belongsTo('language', { inverse: 'customers', async: true }) language;
  @hasMany('telephone', { inverse: 'customer', async: true }) telephones;
  @hasMany('email', { inverse: 'customer', async: true }) emails;
  @hasMany('contact', { inverse: 'customer', async: true }) contacts;
  @hasMany('building', { inverse: 'customer', async: true }) buildings;
  @hasMany('case', { inverse: 'customer', async: true }) cases;
  @hasMany('customer-snapshot', { inverse: 'source', async: true }) snapshots;
  @hasMany('concept', { inverse: null, async: true }) keywords;

  get isCompany() {
    return this.type == CUSTOMER_TYPES.ORGANIZATION;
  }

  get isVatCompany() {
    return this.isCompany && isPresent(this.vatNumber);
  }

  get isActive() {
    return this.status == CUSTOMER_STATUSES.ACTIVE;
  }
}

import { attr, belongsTo, hasMany } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';
import constants from '../config/constants';

const { CUSTOMER_STATUSES } = constants;

export default class ContactModel extends ValidatedModel {
  validators = {
    url: new Validator('format', { type: 'url', allowBlank: true }),
    language: new Validator('presence', {
      presence: true,
      message: 'Kies een geldige taal',
    }),
  };

  @attr('string') uri;
  @attr('string', {
    defaultValue() {
      return CUSTOMER_STATUSES.ACTIVE;
    },
  })
  status;
  @attr('number') position;
  @attr('string') honorificPrefix;
  @attr('string') prefix;
  @attr('string') name;
  @attr('string') suffix;
  @attr('string') url;
  @attr('string') comment;
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

  @belongsTo('address', { inverse: 'contact', async: true }) address;
  @belongsTo('language', { inverse: 'contacts', async: true }) language;
  @hasMany('telephone', { inverse: 'contact', async: true }) telephones;
  @hasMany('email', { inverse: 'contact', async: true }) emails;
  @belongsTo('customer', { inverse: 'contacts', async: true }) customer;
  @hasMany('case', { inverse: 'contact', async: true }) cases;
  @hasMany('contact-snapshot', { inverse: 'source', async: true }) snapshots;

  get printName() {
    let name = '';
    if (this.printPrefix && this.prefix) {
      name += this.prefix + ' ';
    }
    name += this.name || '';
    if (this.printSuffix && this.suffix) {
      name += ' ' + this.suffix;
    }
    return name.trim();
  }

  get searchName() {
    const name = `[${this.position}] ${this.printName}`;
    if (!this.address.get('isBlank')) {
      return `${name} (${this.address.get('fullAddress')})`;
    } else {
      return name;
    }
  }

  get isActive() {
    return this.status == CUSTOMER_STATUSES.ACTIVE;
  }
}

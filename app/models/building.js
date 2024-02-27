import { attr, belongsTo, hasMany } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';
import { isBlank } from '@ember/utils';
import constants from '../config/constants';

const { CUSTOMER_STATUSES } = constants;

export default class BuildingModel extends ValidatedModel {
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

  @belongsTo('address', { inverse: 'building', async: true }) address;
  @belongsTo('language', { inverse: 'buildings', async: true }) language;
  @hasMany('telephone', { inverse: 'building', async: true }) telephones;
  @hasMany('email', { inverse: 'building', async: true }) emails;
  @belongsTo('customer', { inverse: 'buildings', async: true }) customer;
  @hasMany('case', { inverse: 'building', async: true }) cases;
  @hasMany('building-snapshot', { inverse: 'source', async: true }) snapshots;

  get hasBlankName() {
    return [this.prefix, this.name, this.suffix].every((n) => isBlank(n));
  }

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

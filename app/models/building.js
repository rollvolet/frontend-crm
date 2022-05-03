import { attr, belongsTo, hasMany } from '@ember-data/model';
import { isPresent } from '@ember/utils';
import ValidatedModel, { Validator } from './validated-model';

export default class BuildingModel extends ValidatedModel {
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
  };

  @attr name;
  @attr address1;
  @attr address2;
  @attr address3;
  @attr postalCode;
  @attr city;
  @attr prefix;
  @attr suffix;
  @attr email;
  @attr email2;
  @attr url;
  @attr printPrefix;
  @attr printSuffix;
  @attr printInFront;
  @attr comment;
  @attr number;
  @attr('datetime', {
    defaultValue() {
      return new Date();
    },
  })
  created;

  @belongsTo('customer') customer;
  @belongsTo('country') country;
  @belongsTo('language') language;
  @belongsTo('honorific-prefix') honorificPrefix;
  // @hasMany('telephone') telephones;
  @hasMany('request') requests;
  @hasMany('offer') offers;
  @hasMany('order') orders;
  @hasMany('invoice') invoices;

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
    let search = `[${this.number}] ${this.printName}`;
    if (this.postalCode || this.city || this.address) {
      search += ` (${this.fullAddress})`;
    }
    return search;
  }

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
    return `http://data.rollvolet.be/buildings/${this.id}`;
  }
}

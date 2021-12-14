import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  email: validator('format', { type: 'email', allowBlank: true }),
  email2: validator('format', { type: 'email', allowBlank: true }),
  url: validator('format', { type: 'url', allowBlank: true }),
  language: validator('presence', true),
  country: validator('presence', true),
});

export default class ContactModel extends Model.extend(Validations) {
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
  @hasMany('telephone') telephones;
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
    return `[${this.number}] ${this.printName}`;
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
}

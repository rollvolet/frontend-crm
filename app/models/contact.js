import { attr, belongsTo, hasMany } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class ContactModel extends ValidatedModel {
  validators = {
    url: new Validator('format', { type: 'url', allowBlank: true }),
    language: new Validator('presence', {
      presence: true,
      message: 'Kies een geldige taal',
    }),
  };

  @attr('string') uri;
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

  @belongsTo('address', { inverse: 'contact' }) address;
  @belongsTo('language', { inverse: 'contacts' }) language;
  @hasMany('telephone', { inverse: 'contact' }) telephones;
  @hasMany('email', { inverse: 'contact' }) emails;
  @belongsTo('customer', { inverse: 'contacts' }) customer;
  @hasMany('case', { inverse: 'contact' }) cases;
  @hasMany('contact-snapshot', { inverse: 'source' }) snapshots;

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
    return `[${this.position}] ${this.printName}`;
  }
}

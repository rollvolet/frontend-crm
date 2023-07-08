import { attr, belongsTo, hasMany } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class BuildingModel extends ValidatedModel {
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

  @belongsTo('address', { inverse: 'building' }) address;
  @belongsTo('language', { inverse: 'buildings' }) language;
  @hasMany('telephone', { inverse: 'building' }) telephones;
  @hasMany('email', { inverse: 'building' }) emails;
  @belongsTo('customer', { inverse: 'buildings' }) customer;
  @hasMany('case', { inverse: 'building' }) cases;
  @hasMany('building-snapshot', { inverse: 'source' }) snapshots;

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
}

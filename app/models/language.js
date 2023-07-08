import Model, { attr, hasMany } from '@ember-data/model';

export default class LanguageModel extends Model {
  @attr('string') uri;
  @attr('string') code;
  @attr('string') name;
  @attr('string') langTag;

  @hasMany('customer', { inverse: 'language' }) customers;
  @hasMany('contact', { inverse: 'language' }) contacts;
  @hasMany('building', { inverse: 'language' }) buildings;

  @hasMany('customer-snapshot', { inverse: 'language' }) customerSnapshots;
  @hasMany('contact-snapshot', { inverse: 'language' }) contactSnapshots;
}

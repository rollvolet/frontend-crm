import Model, { attr, hasMany } from '@ember-data/model';

export default class LanguageModel extends Model {
  @attr('string') uri;
  @attr('string') code;
  @attr('string') name;
  @attr('string') langTag;

  @hasMany('customer', { inverse: 'language', async: true }) customers;
  @hasMany('contact', { inverse: 'language', async: true }) contacts;
  @hasMany('building', { inverse: 'language', async: true }) buildings;

  @hasMany('customer-snapshot', { inverse: 'language', async: true }) customerSnapshots;
  @hasMany('contact-snapshot', { inverse: 'language', async: true }) contactSnapshots;
}

import Model, { attr, hasMany } from '@ember-data/model';

export default class LanguageModel extends Model {
  @attr('string') code;
  @attr('string') name;

  // TODO remove legacy ID conversion once countries are fully migrated to triplestore
  @attr uuid;

  @hasMany('customer', { inverse: 'language' }) customers;
  @hasMany('contact', { inverse: 'language' }) contacts;
  @hasMany('building', { inverse: 'language' }) buildings;

  @hasMany('customer-snapshot', { inverse: 'language' }) customerSnapshots;
  @hasMany('contact-snapshot', { inverse: 'language' }) contactSnapshots;
}

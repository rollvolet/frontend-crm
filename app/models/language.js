import Model, { attr, hasMany } from '@ember-data/model';

export default class LanguageModel extends Model {
  @attr code;
  @attr name;

  // TODO remove legacy ID conversion once countries are fully migrated to triplestore
  @attr uuid;

  @hasMany('contact') contacts;
  @hasMany('building') buildings;
  @hasMany('customer') customers;

  @hasMany('customer-snapshot', { inverse: 'language' }) customerSnapshots;
  @hasMany('contact-snapshot', { inverse: 'language' }) contactSnapshots;
}

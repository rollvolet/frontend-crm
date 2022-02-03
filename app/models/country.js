import Model, { attr, hasMany } from '@ember-data/model';

export default class CountryModel extends Model {
  @attr code;
  @attr name;
  @attr telephonePrefix;

  // TODO remove legacy ID conversion once countries are fully migrated to triplestore
  @attr uuid;

  @hasMany('contact') contacts;
  @hasMany('building') buildings;
  @hasMany('customer') customers;
}

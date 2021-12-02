import Model, { attr, hasMany } from '@ember-data/model';

export default class CountryModel extends Model {
  @attr code;
  @attr name;
  @attr telephonePrefix;

  @hasMany('contact') contacts;
  @hasMany('building') buildings;
  @hasMany('customer') customers;
}

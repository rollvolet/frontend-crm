import Model, { attr, hasMany } from '@ember-data/model';

export default class LanguageModel extends Model {
  @attr code
  @attr name

  @hasMany('contact') contacts
  @hasMany('building') buildings
  @hasMany('customer') customers
}

import Model, { attr, hasMany } from '@ember-data/model';

export default class TelephoneType extends Model {
  @attr name;

  @hasMany('customer') customers;
}

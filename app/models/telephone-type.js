import Model, { attr, hasMany } from '@ember-data/model';

export default class TelephoneTypeModel extends Model {
  @attr uri;
  @attr code;
  @attr label;

  @hasMany('telephone') telephones;
}

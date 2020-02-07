import Model, { attr, hasMany } from '@ember-data/model';

export default class WayOfEntryModel extends Model {
  @attr name
  @attr position

  @hasMany('request') requests
}

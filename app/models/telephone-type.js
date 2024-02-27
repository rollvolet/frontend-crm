import Model, { attr, hasMany } from '@ember-data/model';

export default class TelephoneTypeModel extends Model {
  @attr('string') uri;
  @attr('string') code;
  @attr('string') label;

  @hasMany('telephone', { inverse: 'telephoneType', async: true }) telephones;
}

import Model, { attr, hasMany } from '@ember-data/model';

export default class CountryModel extends Model {
  @attr('string') uri;
  @attr('string') code;
  @attr('string') name;
  @attr('string') telephonePrefix;

  @hasMany('telephone', { inverse: 'country', async: true }) telephones;
  @hasMany('address', { inverse: 'country', async: true }) addresses;
}

import Model, { attr, hasMany } from '@ember-data/model';

export default class CountryModel extends Model {
  @attr('string') uri;
  @attr('string') code;
  @attr('string') name;
  @attr('string') telephonePrefix;

  // TODO remove legacy ID conversion once countries are fully migrated to triplestore
  @attr uuid;

  @hasMany('telephone', { inverse: 'country' }) telephones;
  @hasMany('address', { inverse: 'country' }) addresses;
}

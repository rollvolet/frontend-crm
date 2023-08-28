import Model, { attr, belongsTo } from '@ember-data/model';

export default class UserClass extends Model {
  @attr('string') uri;
  @attr('string') accountName;
  @attr('string') accountServiceHomepage;

  @belongsTo('user', { inverse: 'account' }) user;
}

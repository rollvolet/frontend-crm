import Model, { attr, hasMany } from '@ember-data/model';

export default class UserGroupClass extends Model {
  @attr('string') uri;
  @attr('string') name;

  @hasMany('user', { inverse: 'user-groups', async: true }) users;
}

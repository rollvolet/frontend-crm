import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class UserClass extends Model {
  @attr('string') uri;
  @attr('string') identifier;
  @attr('string') name;
  @attr('uri-set') userGroups;

  @hasMany('user-group', { inverse: 'users', async: true }) userGroups;
  @belongsTo('account', { inverse: 'user', async: true }) account;
  @belongsTo('employee', { inverse: 'user', async: true }) employee;
  @hasMany('activity', { inverse: 'user', async: true }) activities;

  get firstName() {
    // TODO this is only a best guess. Get correct first name from DB.
    return this.name.split(' ')[0];
  }
}

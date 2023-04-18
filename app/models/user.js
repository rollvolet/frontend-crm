import Model, { attr } from '@ember-data/model';

export default class UserClass extends Model {
  @attr('string') uri;
  @attr('string') identifier;
  @attr('string') name;
}

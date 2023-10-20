import Model, { attr, belongsTo } from '@ember-data/model';

export default class ActivityModel extends Model {
  @attr('string') uri;
  @attr('string') type;
  @attr('datetime') date;
  @attr('string') description;

  @belongsTo('case', { inverse: 'invalidation' }) case;
  @belongsTo('user', { inverse: 'activities' }) user;
}

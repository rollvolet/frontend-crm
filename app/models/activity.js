import Model, { attr, belongsTo } from '@ember-data/model';

export default class ActivityModel extends Model {
  @attr('string') uri;
  @attr('string') type;
  @attr('datetime') date;
  @attr('string') description;

  @belongsTo('case', { inverse: 'invalidation', async: true }) case;
  @belongsTo('user', { inverse: 'activities', async: true }) user;
}

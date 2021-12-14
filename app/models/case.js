import Model, { attr, hasMany } from '@ember-data/model';

export default class CaseModel extends Model {
  @attr uri;
  @attr identifier;

  @hasMany('file') attachments;
}

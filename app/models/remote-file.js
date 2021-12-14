import Model, { attr, belongsTo } from '@ember-data/model';

export default class RemoteFileModel extends Model {
  @attr uri;
  @attr filename;
  @attr format;
  @attr size;
  @attr extension;
  @attr('datetime') created;
  @attr msIdentifier;
  @attr url;

  @belongsTo('file') dataSource;
}

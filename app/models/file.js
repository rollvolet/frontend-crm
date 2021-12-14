import Model, { attr, belongsTo } from '@ember-data/model';

export default class FileModel extends Model {
  @attr uri;
  @attr filename;
  @attr format;
  @attr size;
  @attr extension;
  @attr('datetime') created;

  @belongsTo('remote-file') download;
  @belongsTo('case') case;

  get humanReadableSize() {
    const bytes = this.size;
    const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) {
      return '0 byte';
    } else {
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }
  }
}

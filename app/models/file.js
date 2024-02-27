import Model, { attr, belongsTo } from '@ember-data/model';

export default class FileModel extends Model {
  @attr('string') uri;
  @attr('string') filename;
  @attr('string') type;
  @attr('string') format;
  @attr('number') size;
  @attr('string') extension;
  @attr('datetime') created;

  @belongsTo('remote-file', { inverse: 'dataSource', async: true }) download;
  @belongsTo('case', { inverse: 'attachments', async: true }) case;
  @belongsTo('intervention', { inverse: 'document', async: true }) intervention;
  @belongsTo('offer', { inverse: 'document', async: true }) offer;
  @belongsTo('order', { inverse: 'documents', async: true }) order;
  @belongsTo('invoice-document', { inverse: 'document', async: true, polymorphic: true }) invoice;

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

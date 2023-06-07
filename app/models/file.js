import Model, { attr, belongsTo } from '@ember-data/model';

export default class FileModel extends Model {
  @attr('string') uri;
  @attr('string') filename;
  @attr('string') type;
  @attr('string') format;
  @attr('number') size;
  @attr('string') extension;
  @attr('datetime') created;

  @belongsTo('remote-file') download;
  @belongsTo('case', { inverse: 'attachments' }) case;
  @belongsTo('intervention', { inverse: 'document' }) intervention;
  @belongsTo('request', { inverse: 'document' }) request;
  @belongsTo('offer', { inverse: 'document' }) offer;
  @belongsTo('order', { inverse: 'documents' }) order;
  @belongsTo('invoice-document', { inverse: 'document', polymorphic: true }) invoice;

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

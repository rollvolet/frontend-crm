import Model, { attr, belongsTo } from '@ember-data/model';

export default class ContactSnapshotModel extends Model {
  @attr('string') uri;
  @attr('number') position;
  @attr('string') name;
  @attr('datetime', {
    defaultValue() {
      return new Date();
    },
  })
  created;

  @belongsTo('address', { inverse: 'contactSnapshot', async: true }) address;
  @belongsTo('invoice-document', { inverse: 'contact', async: true, polymorphic: true }) invoice;
  @belongsTo('language', { inverse: 'contactSnapshots', async: true }) language;
  @belongsTo('contact', { inverse: 'snapshots', async: true }) source;
}

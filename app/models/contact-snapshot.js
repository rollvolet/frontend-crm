import Model, { attr, belongsTo } from '@ember-data/model';

export default class ContactSnapshotModel extends Model {
  @attr('string') uri;
  @attr('number') number;
  @attr('string') name;
  @attr('datetime', {
    defaultValue() {
      return new Date();
    },
  })
  created;

  // TODO convert to relation once contacts are added to triplestore
  @attr('string') source;

  @belongsTo('address', { inverse: 'contactSnapshot' }) address;
  @belongsTo('invoice-document', { inverse: 'contact', polymorphic: true }) invoice;
  @belongsTo('language', { inverse: 'contactSnapshots' }) language;
}

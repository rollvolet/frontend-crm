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

  @belongsTo('address', { inverse: 'contactSnapshot' }) address;
  @belongsTo('invoice', { inverse: 'contact' }) invoice;
}

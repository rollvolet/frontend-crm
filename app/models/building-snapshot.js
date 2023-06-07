import Model, { attr, belongsTo } from '@ember-data/model';

export default class BuildingSnapshotModel extends Model {
  @attr('string') uri;
  @attr('number') number;
  @attr('string') name;
  @attr('datetime', {
    defaultValue() {
      return new Date();
    },
  })
  created;

  @belongsTo('address', { inverse: 'buildingSnapshot' }) address;
  @belongsTo('invoice-document', { inverse: 'building', polymorphic: true }) invoice;
  @belongsTo('building', { inverse: 'snapshots' }) source;
}

import Model, { attr, belongsTo } from '@ember-data/model';
import { isBlank } from '@ember/utils';

export default class BuildingSnapshotModel extends Model {
  @attr('string') uri;
  @attr('number') position;
  @attr('string') name;
  @attr('datetime', {
    defaultValue() {
      return new Date();
    },
  })
  created;

  get hasBlankName() {
    return isBlank(name);
  }

  @belongsTo('address', { inverse: 'buildingSnapshot' }) address;
  @belongsTo('invoice-document', { inverse: 'building', polymorphic: true }) invoice;
  @belongsTo('building', { inverse: 'snapshots' }) source;
}

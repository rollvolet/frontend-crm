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
    return isBlank(this.name);
  }

  @belongsTo('address', { inverse: 'buildingSnapshot', async: true }) address;
  @belongsTo('invoice-document', { inverse: 'building', async: true, polymorphic: true }) invoice;
  @belongsTo('building', { inverse: 'snapshots', async: true }) source;
}

import Model, { attr, belongsTo } from '@ember-data/model';
import constants from '../config/constants';

const { CUSTOMER_TYPES } = constants;

export default class CustomerSnapshotModel extends Model {
  @attr('string') uri;
  @attr('string') type;
  @attr('number') number;
  @attr('string') name;
  @attr('string') vatNumber;
  @attr('datetime', {
    defaultValue() {
      return new Date();
    },
  })
  created;

  @belongsTo('address', { inverse: 'customerSnapshot', async: true }) address;
  @belongsTo('invoice-document', { inverse: 'customer', async: true, polymorphic: true }) invoice;
  @belongsTo('language', { inverse: 'customerSnapshots', async: true }) language;
  @belongsTo('customer', { inverse: 'snapshots', async: true }) source;

  get isCompany() {
    return this.type == CUSTOMER_TYPES.ORGANIZATION;
  }
}

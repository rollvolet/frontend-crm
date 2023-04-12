import Model, { attr, belongsTo } from '@ember-data/model';
import { CUSTOMER_TYPES } from '../config/constants';

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

  @belongsTo('address', { inverse: 'customerSnapshot' }) address;
  @belongsTo('invoice', { inverse: 'customer' }) invoice;

  get isCompany() {
    return this.type == CUSTOMER_TYPES.ORGANIZATION;
  }
}

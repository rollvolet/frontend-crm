import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
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

  // TODO convert to relation once customers are added to triplestore
  @attr('string') source;

  @belongsTo('address', { inverse: 'customerSnapshot' }) address;
  @belongsTo('invoice-document', { inverse: 'customer', polymorphic: true }) invoice;
  @hasMany('telephone', { inverse: 'customerSnapshots' }) telephones;

  get isCompany() {
    return this.type == CUSTOMER_TYPES.ORGANIZATION;
  }
}

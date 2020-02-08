import Model, { attr, hasMany } from '@ember-data/model';

export default class PaymentModel extends Model {
  @attr name

  @hasMany('deposit') deposits
}

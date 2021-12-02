import Model, { attr, hasMany } from '@ember-data/model';

export default class VatRateModel extends Model {
  @attr code;
  @attr name;
  @attr rate;
  @attr order;

  @hasMany('offer') offers;
  @hasMany('order') orders;
  @hasMany('invoice') invoices;
}

import Model, { attr, hasMany } from '@ember-data/model';

export default class VatRateModel extends Model {
  @attr code;
  @attr name;
  @attr rate;
  @attr order;

  // TODO remove legacy ID conversion once VAT rates are fully migrated to triplestore
  @attr uuid;

  @hasMany('offer') offers;
  @hasMany('order') orders;
  @hasMany('invoice') invoices;
}

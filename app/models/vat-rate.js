import Model, { attr, hasMany } from '@ember-data/model';

export default class VatRateModel extends Model {
  @attr code;
  @attr name;
  @attr rate;
  @attr order;

  // TODO remove legacy ID conversion once VAT rates are fully migrated to triplestore
  @attr uuid;

  // Legacy relations in SQL DB
  @hasMany('offer') offers;
  @hasMany('order') orders;


  @hasMany('offerline') offerlines;
  @hasMany('invoicelines') invoicelines;
  @hasMany('case') cases;
}

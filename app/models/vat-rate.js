import Model, { attr, hasMany } from '@ember-data/model';

export default class VatRateModel extends Model {
  @attr('string') uri;
  @attr('string') code;
  @attr('string') name;
  @attr('string') rate;
  @attr('number') position;

  @hasMany('offerline') offerlines;
  @hasMany('invoicelines') invoicelines;
  @hasMany('case') cases;
}

import Model, { attr, hasMany } from '@ember-data/model';

export default class VatRateModel extends Model {
  @attr('string') uri;
  @attr('string') name;
  @attr('string') rate;
  @attr('number') position;

  @hasMany('offerline', { inverse: 'vatRate' }) offerlines;
  @hasMany('invoicelines', { inverse: 'vatRate' }) invoicelines;
  @hasMany('case', { inverse: 'vatRate' }) cases;
}

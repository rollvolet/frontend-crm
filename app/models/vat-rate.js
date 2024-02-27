import Model, { attr, hasMany } from '@ember-data/model';

export default class VatRateModel extends Model {
  @attr('string') uri;
  @attr('string') name;
  @attr('string') rate;
  @attr('number') position;

  @hasMany('offerline', { inverse: 'vatRate', async: true }) offerlines;
  @hasMany('invoicelines', { inverse: 'vatRate', async: true }) invoicelines;
  @hasMany('case', { inverse: 'vatRate', async: true }) cases;
}

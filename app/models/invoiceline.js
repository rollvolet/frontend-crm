import Model, { attr, belongsTo } from '@ember-data/model';

export default class InvoicelineModel extends Model {
  @attr sequenceNumber
  @attr description
  @attr('number') amount

  @belongsTo('vat-rate') vatRate
  @belongsTo('order') order
  @belongsTo('invoice') invoice

  get arithmeticAmount() {
    return this.amount;
  }

  get arithmeticVat() {
    return (async () => {
      const vatRate = await this.vatRate;
      const rate = vatRate.rate / 100;
      const vat = this.amount * rate;
      return vat;
    })();
  }
}

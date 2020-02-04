import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

const Validations = buildValidations({
  amount: validator('presence', true),
  vatRate: validator('presence', true),
  description: validator('presence', true)
});

export default class InvoicelineModel extends Model.extend(Validations, LoadableModel) {
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

import Model, { attr, belongsTo } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  amount: validator('presence', true),
  currency: validator('presence', true),
  vatRate: validator('presence', true),
  description: validator('presence', true),
});

export default class InvoicelineModel extends Model.extend(Validations) {
  @attr sequenceNumber;
  @attr('string', {
    defaultValue() {
      return 'EUR';
    },
  }) currency;
  @attr type;
  @attr description;
  @attr('number') amount;
  @attr order;
  @attr invoice;

  @belongsTo('vat-rate') vatRate;
  // @belongsTo('order') order;
  // @belongsTo('invoice') invoice;

  get arithmeticAmount() {
    return this.amount;
  }

  // Indicates whether line is added on the invoice after the order had already been finished
  get isSupplement() {
    // TODO update once invoice is defined as a relation on invoiceline
    // it's a supplement if the invoice has an order, but the order is not linked to the invoiceline
    // return this.invoice.get('order.id') && !this.order;
    return this.type == 'http://data.rollvolet.be/vocabularies/crm/AccessInvoiceSupplement';
  }
}

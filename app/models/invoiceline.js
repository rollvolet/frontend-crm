import { attr, belongsTo } from '@ember-data/model';
import ValidatedModel, { Validator } from './validated-model';

export default class InvoicelineModel extends ValidatedModel {
  validators = {
    amount: new Validator('presence', {
      presence: true,
    }),
    currency: new Validator('presence', {
      presence: true,
    }),
    vatRate: new Validator('presence', {
      presence: true,
    }),
    description: new Validator('presence', {
      presence: true,
    }),
  };

  @attr position;
  @attr('string', {
    defaultValue() {
      return 'EUR';
    },
  })
  currency;
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

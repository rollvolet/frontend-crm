import { tracked } from '@glimmer/tracking';

export default class Case {
  @tracked customerId = null;
  @tracked requestId = null;
  @tracked offerId = null;
  @tracked orderId = null;
  @tracked invoiceId = null;

  @tracked customer = null;
  @tracked request = null;
  @tracked offer = null;
  @tracked order = null;
  @tracked invoice = null;

  constructor({ customerId, requestId, offerId, orderId, invoiceId }) {
    this.customerId = customerId;
    this.requestId = requestId;
    this.offerId = offerId;
    this.orderId = orderId;
    this.invoiceId = invoiceId;
  }
}

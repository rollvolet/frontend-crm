import { tracked } from '@glimmer/tracking';

export default class Case {
  @tracked customerId = null;
  @tracked contactId = null;
  @tracked buildingId = null;

  @tracked requestId = null;
  @tracked offerId = null;
  @tracked orderId = null;
  @tracked invoiceId = null;

  @tracked customer = null;
  @tracked contact = null;
  @tracked building = null;
  @tracked request = null;
  @tracked offer = null;
  @tracked order = null;
  @tracked invoice = null;

  constructor({ customerId, contactId, buildingId, requestId, offerId, orderId, invoiceId }) {
    this.customerId = customerId;
    this.contactId = contactId;
    this.buildingId = buildingId;
    this.requestId = requestId;
    this.offerId = offerId;
    this.orderId = orderId;
    this.invoiceId = invoiceId;
  }
}

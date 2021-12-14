import { tracked } from '@glimmer/tracking';

export default class CaseDispatcher {
  @tracked customerId = null;
  @tracked contactId = null;
  @tracked buildingId = null;

  @tracked requestId = null;
  @tracked interventionId = null;
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

  constructor({
    customerId,
    contactId,
    buildingId,
    interventionId,
    requestId,
    offerId,
    orderId,
    invoiceId,
  }) {
    this.customerId = customerId;
    this.contactId = contactId;
    this.buildingId = buildingId;
    this.requestId = requestId;
    this.interventionId = interventionId;
    this.offerId = offerId;
    this.orderId = orderId;
    this.invoiceId = invoiceId;
  }

  get identifier() {
    if (this.requestId) {
      return `AD-${this.requestId}`;
    } else if (this.interventionId) {
      return `IR-${this.interventionId}`;
    } else if (this.invoiceId) {
      return this.invoiceId; // isolated invoice
    } else {
      throw new Error(
        'Cannot determine unique identifier for case. Case is in an unsupported state.'
      );
    }
  }

  get uri() {
    return `http://data.rollvolet.be/cases/${this.identifier}`;
  }
}

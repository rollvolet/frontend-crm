import { tracked } from '@glimmer/tracking';

const ATTRS = [
  'customerId',
  'contactId',
  'buildingId',
  'interventionId',
  'requestId',
  'offerId',
  'orderId',
  'invoiceId',
];
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

  constructor(params) {
    for (let key of ATTRS) {
      this[key] = params[key];
    }
  }

  get identifier() {
    if (this.requestId) {
      return `AD-${this.requestId}`;
    } else if (this.interventionId) {
      return `IR-${this.interventionId}`;
    } else if (this.invoice) {
      return `F-${this.invoice.number}`; // isolated invoice
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

import Service from '@ember/service';
import fetchNextNumber from '../utils/fetch-next-number';
import constants from '../config/constants';

const TYPES = constants.RESOURCE_CLASSES;

export default class SequenceService extends Service {
  fetchNextCustomerNumber() {
    return fetchNextNumber(TYPES.CUSTOMER);
  }

  fetchNextContactPosition(customer) {
    return fetchNextNumber(TYPES.CONTACT, customer.uri);
  }

  fetchNextBuildingPosition(customer) {
    return fetchNextNumber(TYPES.BUILDING, customer.uri);
  }

  fetchNextInterventionNumber() {
    return fetchNextNumber(TYPES.INTERVENTION);
  }

  fetchNextRequestNumber() {
    return fetchNextNumber(TYPES.REQUEST);
  }

  fetchNextOfferNumber() {
    return fetchNextNumber(TYPES.OFFER);
  }

  fetchNextInvoiceNumber() {
    return fetchNextNumber(TYPES.INVOICE_DOCUMENT);
  }
}

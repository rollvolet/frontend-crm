import classic from 'ember-classic-decorator';
import EmberObject from '@ember/object';

@classic
export default class Case extends EmberObject {
  customerId = null;
  requestId = null;
  offerId = null;
  orderId = null;
  invoiceId = null;
}

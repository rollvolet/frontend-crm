import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MainCaseInvoiceEditRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('invoice', params.invoice_id, {
      include: 'case.vat-rate',
    });
  }
}

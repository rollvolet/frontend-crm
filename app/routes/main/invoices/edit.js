import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainInvoicesEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    this.invoiceId = params.invoice_id;
    return this.store.queryOne('case', {
      'filter[invoice][:id:]': params.invoice_id,
    });
  }

  afterModel(model) {
    this.router.transitionTo('main.case.invoice.edit.index', model.id, this.invoiceId);
  }
}

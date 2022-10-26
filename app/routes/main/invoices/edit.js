import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainInvoicesEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('invoice', params.invoice_id);
  }

  async afterModel(model) {
    // TODO get related case via invoice model once relation is fully defined
    const _case = await this.store.queryOne('case', {
      'filter[:exact:invoice]': model.uri,
    });
    this.router.transitionTo('main.case.invoice.edit.index', _case.id, model.id);
  }
}

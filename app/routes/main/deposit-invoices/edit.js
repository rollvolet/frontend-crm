import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainDepositInvoicesEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('deposit-invoice', params.deposit_invoice_id);
  }

  async afterModel(model) {
    const order = await model.order;
    // TODO get related case via order model once relation is fully defined
    const _case = await this.store.queryOne('case', {
      'filter[:exact:order]': order.uri,
    });
    this.router.transitionTo('main.case.order.edit.deposit-invoices', _case.id, order.id);
  }
}

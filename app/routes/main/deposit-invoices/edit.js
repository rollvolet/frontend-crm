import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainDepositInvoicesEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.queryOne('case', {
      'filter[deposit-invoices][:id:]': params.deposit_invoice_id,
      include: 'order',
    });
  }

  async afterModel(model) {
    const order = await model.order;
    this.router.transitionTo('main.case.order.edit.deposit-invoices', model.id, order.id);
  }
}

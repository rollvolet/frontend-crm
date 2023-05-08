import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MainDepositInvoicesEditRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store.findRecord('deposit-invoice', params.deposit_invoice_id);
  }

  async afterModel(model) {
    const _case = await model.case;
    const orderUri = _case.order;
    const orderId = orderUri.substr(orderUri.lastIndexOf('/') + 1);
    this.router.transitionTo('main.case.order.edit.deposit-invoices', _case.id, orderId);
  }
}

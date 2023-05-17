import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MainCaseOrderEditDepositInvoicesRoute extends Route {
  @service store;

  model() {
    this.case = this.modelFor('main.case');
    return this.store.query('deposit-invoice', {
      sort: '-number',
      page: {
        size: 1000, // we don't expect more than 1000 deposit invoices for 1 case
      },
      include: 'case.vat-rate',
      'filter[case][:uri:]': this.case.uri,
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.case = this.case;
  }

  @action
  deactivate() {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor('main.case.order.edit.deposit-invoices');
    controller.resetNewlyCreatedDepositInvoice();
  }
}

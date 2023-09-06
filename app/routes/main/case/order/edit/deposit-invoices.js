import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MainCaseOrderEditDepositInvoicesRoute extends Route {
  @service store;

  async model() {
    const _case = this.modelFor('main.case');
    const depositInvoices = await this.store.query('deposit-invoice', {
      sort: '-number',
      page: {
        size: 1000, // we don't expect more than 1000 deposit invoices for 1 case
      },
      include: 'case.vat-rate',
      'filter[case][:uri:]': _case.uri,
    });

    return {
      case: _case,
      depositInvoices,
    };
  }

  @action
  deactivate() {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor('main.case.order.edit.deposit-invoices');
    controller.resetNewlyCreatedDepositInvoice();
  }
}

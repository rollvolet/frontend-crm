import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { hash } from 'rsvp';

export default class DepositInvoicesRoute extends Route {
  model() {
    const order = this.modelFor('main.case.order.edit');
    const depositInvoices = this.store.query('depositInvoice', {
      sort: '-number',
      page: {
        size: 1000 // we don't expect more than 1000 deposit invoices for 1 order
      },
      include: 'vat-rate',
      filter: {
        order: {
          id: order.get('id')
        }
      }
    });

    const deposits = order.deposits;
    return hash({
      depositInvoices,
      deposits
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }
}

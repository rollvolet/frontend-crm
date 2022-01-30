import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import applyFilterParams from '../../../utils/apply-filter-params';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class IndexController extends Controller {
  @service router;

  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = '-number';

  @action
  applyFilter(filter) {
    applyFilterParams.bind(this)(filter);
  }

  @action
  previousPage() {
    this.selectPage(this.page - 1);
  }

  @action
  nextPage() {
    this.selectPage(this.page + 1);
  }

  @action
  selectPage(page) {
    this.page = page;
  }

  @action
  async navigateToDetail(depositInvoice) {
    const customer = await depositInvoice.customer;
    const order = await depositInvoice.order;
    this.router.transitionTo('main.case.order.edit.deposit-invoices', customer.id, order.id);
  }
}

import Controller from '@ember/controller';
import applyFilterParams from '../../../utils/apply-filter-params';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class IndexController extends Controller {
  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = '-number';

  @action
  clickRow(row) {
    const customerId = row.get('customer.id');
    const orderId = row.get('order.id');
    this.transitionToRoute('main.case.order.edit.deposit-invoices', customerId, orderId);
  }

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
}

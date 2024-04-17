import Controller from '@ember/controller';
import { service } from '@ember/service';
import applyFilterParams from '../../../utils/apply-filter-params';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MainDepositInvoicesIndexController extends Controller {
  @service router;

  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = '-number';
  isCancelled = -1;

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
  navigateToDetail(depositInvoice) {
    this.router.transitionTo('main.deposit-invoices.edit', depositInvoice.uuid);
  }
}

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import applyFilterParams from '../../../utils/apply-filter-params';

export default class IndexController extends Controller {
  @service router;

  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = 'name';

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
  navigateToDetail(customer) {
    this.router.transitionTo('main.customers.edit', customer.id, {
      queryParams: {
        tab: 'requests',
      },
    });
  }
}

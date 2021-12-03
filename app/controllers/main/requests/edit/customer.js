import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import applyFilterParams from '../../../../utils/apply-filter-params';
import { task } from 'ember-concurrency';

export default class CustomerController extends Controller {
  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = 'name';

  @task
  *linkCustomerToRequest(customer) {
    this.request.customer = customer;
    yield this.request.save();
    this.transitionToRoute('main.case.request.edit', customer, this.request);
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

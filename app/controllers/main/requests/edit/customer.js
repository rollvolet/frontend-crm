import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import applyFilterParams from '../../../../utils/apply-filter-params';

export default class CustomerController extends Controller {
  page = 0;
  size = 25;
  sort = 'name';

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
    this.set('page', page);
  }
}

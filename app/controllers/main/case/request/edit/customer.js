import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import applyFilterParams from '../../../../../utils/apply-filter-params';

export default class MainCaseRequestEditCustomerController extends Controller {
  @service router;

  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = 'name';

  case;
  request;

  @task
  *linkCustomerToRequest(customer) {
    this.case.customer = customer;
    yield this.case.save();
    this.router.transitionTo('main.case.request.edit.index', this.case.id, this.request.id);
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

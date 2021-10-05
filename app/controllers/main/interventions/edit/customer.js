import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import applyFilterParams from '../../../../utils/apply-filter-params';

export default class MainInterventionsEditCustomerController extends Controller {
  page = 0;
  size = 25;
  sort = 'name';

  @task
  *linkCustomerToIntervention(customer) {
    this.intervention.customer = customer;
    yield this.intervention.save();
    this.transitionToRoute('main.case.intervention.edit', customer, this.intervention);
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

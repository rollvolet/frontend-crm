import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import applyFilterParams from '../../../../utils/apply-filter-params';
import { task } from 'ember-concurrency';

export default class MainInterventionsEditCustomerController extends Controller {
  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = 'name';

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
    this.page = page;
  }
}

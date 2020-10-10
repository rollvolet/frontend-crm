import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import applyFilterParams from '../../../../utils/apply-filter-params';

export default class MainInterventionsEditCustomerController extends Controller.extend(DefaultQueryParams) {
  size = 25;

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
}

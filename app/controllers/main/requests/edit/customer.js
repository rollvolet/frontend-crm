import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import { task } from 'ember-concurrency';
import applyFilterParams from '../../../../utils/apply-filter-params';

@classic
export default class CustomerController extends Controller.extend(DefaultQueryParams) {
  size = 25;

  @task(function * (customer) {
    this.request.set('customer', customer);
    yield this.request.save();
    this.transitionToRoute('main.case.request.edit', customer, this.request);
  })
  linkCustomerToRequest;

  @action
  applyFilter(filter) {
    applyFilterParams.bind(this)(filter);
  }
}

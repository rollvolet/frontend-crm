import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import { task } from 'ember-concurrency';
import applyFilterParams from '../../../../utils/apply-filter-params';

export default Controller.extend(DefaultQueryParams, {
  size: 25,

  linkCustomerToRequest: task(function * (customer) {
    this.request.set('customer', customer);
    yield this.request.save();
    this.transitionToRoute('main.case.request.edit', customer, this.request);
  }),

  actions: {
    applyFilter(filter) {
      applyFilterParams.bind(this)(filter);
    }
  }
});

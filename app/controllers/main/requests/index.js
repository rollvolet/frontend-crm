import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import applyFilterParams from '../../../utils/apply-filter-params';

export default Controller.extend(DefaultQueryParams, {
  size: 25,
  sort: '-request-date',

  actions: {
    clickRow(row) {
      const customerId = row.get('customer.id');
      const requestId = row.get('id');
      if (customerId)
        this.transitionToRoute('main.case.request.edit', customerId, requestId);
      else
        this.transitionToRoute('main.requests.edit', requestId);
    },
    applyFilter(filter) {
      applyFilterParams.bind(this)(filter);
    }
  }
});

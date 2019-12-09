import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import applyFilterParams from '../../../utils/apply-filter-params';

export default Controller.extend(DefaultQueryParams, {
  size: 25,
  sort: '-number',

  actions: {
    clickRow(row) {
      const customerId = row.get('customer.id');
      const orderId = row.get('order.id');
      this.transitionToRoute('main.case.order.edit.deposit-invoices', customerId, orderId);
    },
    applyFilter(filter) {
      applyFilterParams.bind(this)(filter);
    }
  }
});

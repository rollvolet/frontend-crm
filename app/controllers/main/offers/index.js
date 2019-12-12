import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import applyFilterParams from '../../../utils/apply-filter-params';

export default Controller.extend(DefaultQueryParams, {
  size: 25,
  sort: '-number',

  actions: {
    clickRow(row) {
      const customerId = row.get('customer.id');
      const offerId = row.get('id');
      this.transitionToRoute('main.case.offer.edit', customerId, offerId);
    },
    applyFilter(filter) {
      applyFilterParams.bind(this)(filter);
    }
  }

});

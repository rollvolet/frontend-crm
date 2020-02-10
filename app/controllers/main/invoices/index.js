import { action } from '@ember/object';
import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import applyFilterParams from '../../../utils/apply-filter-params';

export default class IndexController extends Controller.extend(DefaultQueryParams) {
  size = 25
  sort = '-number'

  @action
  clickRow(row) {
    const customerId = row.get('customer.id');
    const invoiceId = row.get('id');
    this.transitionToRoute('main.case.invoice.edit', customerId, invoiceId);
  }

  @action
  applyFilter(filter) {
    applyFilterParams.bind(this)(filter);
  }
}

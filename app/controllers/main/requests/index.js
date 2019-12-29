import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import applyFilterParams from '../../../utils/apply-filter-params';

@classic
export default class IndexController extends Controller.extend(DefaultQueryParams) {
  size = 25;
  sort = '-request-date';

  @action
  clickRow(row) {
    const customerId = row.get('customer.id');
    const requestId = row.get('id');
    if (customerId)
      this.transitionToRoute('main.case.request.edit', customerId, requestId);
    else
      this.transitionToRoute('main.requests.edit', requestId);
  }

  @action
  applyFilter(filter) {
    applyFilterParams.bind(this)(filter);
  }
}

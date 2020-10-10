import { action } from '@ember/object';
import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import applyFilterParams from '../../../utils/apply-filter-params';

export default class IndexController extends Controller.extend(DefaultQueryParams) {
  size = 25
  sort = '-date'

  @action
  clickRow(row, e) {
    if (e.target.getAttribute('role') != 'button') {
      const customerId = row.get('customer.id');
      const interventionId = row.get('id');
      if (customerId)
        this.transitionToRoute('main.case.intervention.edit', customerId, interventionId);
      else
        this.transitionToRoute('main.interventions.edit', interventionId);
    }
  }

  @action
  applyFilter(filter) {
    applyFilterParams.bind(this)(filter);
  }

  @action
  toggleDescription(row) {
    row.set('expandDescription', !row.expandDescription);
  }
}

import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import applyFilterParams from '../../../utils/apply-filter-params';

@classic
export default class IndexController extends Controller.extend(DefaultQueryParams) {
  size = 25;

  @action
  clickRow(row) {
    this.transitionToRoute('main.customers.edit', row);
  }

  @action
  applyFilter(filter) {
    applyFilterParams.bind(this)(filter);
  }
}

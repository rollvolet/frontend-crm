import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import applyFilterParams from '../../../utils/apply-filter-params';

export default class IndexController extends Controller {
  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = 'name';

  @action
  clickRow(row) {
    this.transitionToRoute('main.customers.edit', row);
  }

  @action
  applyFilter(filter) {
    applyFilterParams.bind(this)(filter);
  }

  @action
  previousPage() {
    this.selectPage(this.page - 1);
  }

  @action
  nextPage() {
    this.selectPage(this.page + 1);
  }

  @action
  selectPage(page) {
    this.set('page', page);
  }
}

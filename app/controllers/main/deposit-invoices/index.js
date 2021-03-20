import Controller from '@ember/controller';
import applyFilterParams from '../../../utils/apply-filter-params';
import { action } from '@ember/object';

export default class IndexController extends Controller {
  page = 0;
  size = 25;
  sort = '-number';

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

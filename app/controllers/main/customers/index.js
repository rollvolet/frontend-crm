import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import applyFilterParams from '../../../utils/apply-filter-params';

export default class IndexController extends Controller {
  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = 'name';

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
    this.page = page;
  }
}

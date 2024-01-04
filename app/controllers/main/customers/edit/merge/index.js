import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import applyFilterParams from '../../../../../utils/apply-filter-params';

export default class MainCustomersEditMergeIndexController extends Controller {
  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = 'name,prefix';
  @tracked onlyActive = true;

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

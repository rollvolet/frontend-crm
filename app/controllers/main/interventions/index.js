import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import applyFilterParams from '../../../utils/apply-filter-params';

export default class IndexController extends Controller {
  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = '-date';
  @tracked isCancelled = 0;
  @tracked hasInvoice = 0;
  @tracked isPlanned = -1;

  @action
  applyFilter(filter) {
    applyFilterParams.bind(this)(filter);
  }

  @action
  toggleDescription(row) {
    row.set('isExpandedDescription', !row.isExpandedDescription);
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

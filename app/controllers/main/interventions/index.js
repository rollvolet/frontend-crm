import Controller from '@ember/controller';
import { action } from '@ember/object';
import applyFilterParams from '../../../utils/apply-filter-params';

export default class IndexController extends Controller {
  page = 0;
  size = 25;
  sort = '-date';
  isCancelled = 0;
  hasInvoice = 0;
  isPlanned = -1;

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
    this.set('page', page);
  }
}

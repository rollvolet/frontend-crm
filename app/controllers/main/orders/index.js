import Controller from '@ember/controller';
import { action } from '@ember/object';
import applyFilterParams from '../../../utils/apply-filter-params';

export default class IndexController extends Controller {
  page = 0;
  size = 25;
  sort = '-order-date';
  withoutInvoice = false; // enforce boolean datatype
  onlyNotCanceled = false; // enforce boolean datatype

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

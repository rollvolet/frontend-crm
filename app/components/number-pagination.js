import NumberPagination from 'ember-data-table/components/number-pagination';
import classic from 'ember-classic-decorator';
import { action } from '@ember/object';

@classic
export default class OctaneNumberPagination extends NumberPagination {
  @action
  changePage(link) {
    this.set('page', link['number'] || 0);
  }
  @action
  setCurrentPage(page) {
    this.set('currentPage', page);
  }
  @action
  setSize(size) {
    this.set('size', size);
  }
}

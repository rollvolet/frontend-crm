import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import applyFilterParams from '../../../utils/apply-filter-params';

export default class IndexController extends Controller {
  @service router;

  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = '-date';
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
    this.page = page;
  }

  @action
  navigateToDetail(intervention, event) {
    const isExpandableElement = event.srcElement?.hasAttribute('data-expandable');
    if (!isExpandableElement) {
      this.router.transitionTo('main.interventions.edit', intervention.id);
    }
  }
}

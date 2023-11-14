import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import applyFilterParams from '../../../utils/apply-filter-params';

export default class MainOffersIndexController extends Controller {
  @service router;

  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = '-offer-date';
  hasOrder = -1;
  isCancelled = 0;

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

  @action
  navigateToDetail(offer) {
    this.router.transitionTo('main.case.offer.edit.index', offer.case.uuid, offer.uuid);
  }
}

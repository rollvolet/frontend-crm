import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { observes } from '@ember-decorators/object';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import DebouncedSearch from '../../mixins/debounced-search-task';
import { task } from 'ember-concurrency';

@classic
@classNames('offers-table')
export default class OffersTable extends Component.extend(DebouncedSearch) {
  @service
  router;

  init() {
    super.init(...arguments);
    this.search.perform();
  }

  page = 0;
  size = 10;
  sort = '-offer-date';

  @observes('page', 'size', 'sort')
  dataTableParamChanged() { // eslint-disable-line ember/no-observers
    this.search.perform();
  }

  @task(function * () {
    const offers = yield this.customer.query('offers', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'building,request',
      filter: {
        'request-number': this.getFilterValue('requestNumber'),
        number: this.getFilterValue('number'),
        reference: this.getFilterValue('reference'),
        building: {
          name: this.getFilterValue('name'),
          'postal-code': this.getFilterValue('postalCode'),
          city: this.getFilterValue('city'),
          street: this.getFilterValue('street')
        }
      }
    });
    this.set('offers', offers);
  })
  search;

  @action
  setFilter(key, value) {
    this.set(key, value);
    this.debounceSearch.perform(this.search);
  }

  @action
  resetFilters() {
    this.set('requestNumber', undefined);
    this.set('number', undefined);
    this.set('reference', undefined);
    this.set('name', undefined);
    this.set('postalCode', undefined);
    this.set('city', undefined);
    this.set('street', undefined);
    this.search.perform();
  }

  @action
  clickRow(row) {
    const offerId = row.get('id');
    this.router.transitionTo('main.case.offer.edit', this.customer, offerId);
  }
}

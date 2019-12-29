import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { observes } from '@ember-decorators/object';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import DebouncedSearch from '../../mixins/debounced-search-task';
import { task } from 'ember-concurrency';

@classic
@classNames('requests-table')
export default class RequestsTable extends Component.extend(DebouncedSearch) {
  @service
  router;

  init() {
    super.init(...arguments);
    this.search.perform();
  }

  page = 0;
  size = 10;
  sort = '-request-date';

  @observes('page', 'size', 'sort')
  dataTableParamChanged() { // eslint-disable-line ember/no-observers
    this.search.perform();
  }

  @task(function * () {
    const requests = yield this.customer.query('requests', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'way-of-entry,building',
      filter: {
        number: this.getFilterValue('number'),
        building: {
          name: this.getFilterValue('name'),
          'postal-code': this.getFilterValue('postalCode'),
          city: this.getFilterValue('city'),
          street: this.getFilterValue('street')
        }
      }
    });
    this.set('requests', requests);
  })
  search;

  @action
  setFilter(key, value) {
    this.set(key, value);
    this.debounceSearch.perform(this.search);
  }

  @action
  resetFilters() {
    ['number', 'name', 'postalCode', 'city', 'street'].forEach(f => this.set(f, undefined));
    this.search.perform();
  }

  @action
  clickRow(row) {
    const requestId = row.get('id');
    this.router.transitionTo('main.case.request.edit', this.customer, requestId);
  }

  @action
  openNewRequest() {
    this.router.transitionTo('main.case.request.new', this.customer);
  }
}

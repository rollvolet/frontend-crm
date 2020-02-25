import classic from 'ember-classic-decorator';
import { observes } from '@ember-decorators/object';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import FilterComponent from '../data-table-filter';
import { task } from 'ember-concurrency';

@classic
export default class RequestsTable extends FilterComponent {
  @service router
  @service store

  page = 0;
  size = 10;
  sort = '-request-date';
  filterKeys = Object.freeze(['number', 'name', 'postalCode', 'city', 'street'])

  init() {
    super.init(...arguments);
    this.search.perform(this.getFilter());
  }

  async onChange(filter) {
    await this.search.perform(filter);
  }

  @observes('page', 'size', 'sort')
  dataTableParamChanged() { // eslint-disable-line ember/no-observers
    this.search.perform(this.getFilter());
  }

  @task(function * (filter) {
    const requests = yield this.store.query('request', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'building',
      filter: {
        customer: {
          number: this.customer.number
        },
        number: filter.number,
        building: {
          name: filter.name,
          'postal-code': filter.postalCode,
          city: filter.city,
          street: filter.street
        }
      }
    });
    this.set('requests', requests);
  })
  search;

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

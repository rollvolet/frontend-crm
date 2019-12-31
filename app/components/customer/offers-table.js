import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { observes } from '@ember-decorators/object';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import FilterComponent from '../data-table-filter';
import { task } from 'ember-concurrency';

@classic
@classNames('offers-table')
export default class OffersTable extends FilterComponent {
  @service
  router;

  @service
  store;

  page = 0;
  size = 10;
  sort = '-offer-date';
  filterKeys = Object.freeze(['requestNumber', 'number', 'reference', 'name', 'postalCode', 'city', 'street'])

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
    const offers = yield this.store.query('offer', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'building,request',
      filter: {
        customer: {
          number: this.customer.number
        },
        'request-number': filter.requestNumber,
        number: filter.number,
        reference: filter.reference,
        building: {
          name: filter.name,
          'postal-code': filter.postalCode,
          city: filter.city,
          street: filter.street
        }
      }
    });
    this.set('offers', offers);
  })
  search;

  @action
  clickRow(row) {
    const offerId = row.get('id');
    this.router.transitionTo('main.case.offer.edit', this.customer, offerId);
  }
}

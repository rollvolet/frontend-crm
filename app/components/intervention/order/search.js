import classic from 'ember-classic-decorator';
import { observes } from '@ember-decorators/object';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import FilterComponent from '../../data-table-filter';
import { task } from 'ember-concurrency';

@classic
export default class OrdersTable extends FilterComponent {
  @service router

  @service store

  page = 0;
  size = 10;
  sort = '-order-date';
  filterKeys = Object.freeze(['requestNumber', 'offerNumber', 'reference', 'name', 'postalCode', 'city', 'street'])

  async init() {
    super.init(...arguments);
    const customer = await this.model.customer;
    this.set('nameFilter', customer.name);
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
    const orders = yield this.store.query('order', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'customer,offer',
      filter: {
        customer: {
          name: filter.name,
          'postal-code': filter.postalCode,
          city: filter.city,
          street: filter.street
        },
        'request-number': filter.requestNumber,
        'offer-number': filter.offerNumber,
        reference: filter.reference,
      }
    });
    this.set('orders', orders);
  })
  search;
}

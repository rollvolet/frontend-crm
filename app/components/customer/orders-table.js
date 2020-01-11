import classic from 'ember-classic-decorator';
import { observes } from '@ember-decorators/object';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import FilterComponent from '../data-table-filter';
import { task } from 'ember-concurrency';

@classic
export default class OrdersTable extends FilterComponent {
  @service router;

  @service store;

  page = 0;
  size = 10;
  sort = '-order-date';
  filterKeys = Object.freeze(['requestNumber', 'offerNumber', 'reference', 'name', 'postalCode', 'city', 'street'])

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
    const orders = yield this.store.query('order', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'building,offer',
      filter: {
        customer: {
          number: this.customer.number
        },
        'request-number': filter.requestNumber,
        'offer-number': filter.offerNumber,
        reference: filter.reference,
        building: {
          name: filter.name,
          'postal-code': filter.postalCode,
          city: filter.city,
          street: filter.street
        }
      }
    });
    this.set('orders', orders);
  })
  search;

  @action
  clickRow(row) {
    const orderId = row.get('id');
    this.router.transitionTo('main.case.order.edit', this.customer, orderId);
  }
}

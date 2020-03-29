import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency-decorators';

export default class OrdersTable extends FilterComponent {
  @service router
  @service store

  @tracked orders = []

  constructor() {
    super(...arguments);
    this.initFilter(['requestNumber', 'offerNumber', 'reference', 'name', 'postalCode', 'city', 'street']);
    this.filter.set('page', 0);
    this.filter.set('size', 10);
    this.filter.set('sort', '-order-date');

    // Setup observers for 2-way binded values of ember-data-table
    this.filter.addObserver('page', this, 'onDataTableParamChange'); // eslint-disable-line ember/no-observers
    this.filter.addObserver('size', this, 'onDataTableParamChange'); // eslint-disable-line ember/no-observers
    this.filter.addObserver('sort', this, 'onDataTableParamChange'); // eslint-disable-line ember/no-observers

    this.initSearch();
  }

  async initSearch() {
    const customer = await this.args.model.customer;
    this.filter.set('name', customer.name);
    this.search.perform(this.filter);
  }

  onChange(filter) {
    if (filter.page != 0)
      filter.set('page', 0); // search will be triggered by onDataTableParamChange()
    else
      this.search.perform(filter);
  }

  onDataTableParamChange() {
    this.search.perform(this.filter);
  }

  willDestroy() {
    this.filter.removeObserver('page', this, 'onDataTableParamChange');
    this.filter.removeObserver('size', this, 'onDataTableParamChange');
    this.filter.removeObserver('sort', this, 'onDataTableParamChange');
  }

  @restartableTask
  *search(filter) {
    this.orders = yield this.store.query('order', {
      page: {
        size: filter.size,
        number: filter.page
      },
      sort: filter.sort,
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
  }
}

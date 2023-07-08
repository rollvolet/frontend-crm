import FilterComponent from '../data-table-filter';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';

export default class InterventionOrderSearchModalComponent extends FilterComponent {
  @service router;
  @service store;

  @tracked orders = [];

  constructor() {
    super(...arguments);
    this.initFilter([
      'requestNumber',
      'offerNumber',
      'reference',
      'name',
      'postalCode',
      'city',
      'street',
    ]);
    this.sort = '-order-date';
    this.initSearch();
  }

  onChange(filter) {
    if (this.page != 0) this.page = 0;
    this.search.perform(filter);
  }

  async initSearch() {
    const customer = await this.args.model.customer;
    this.filter.set('name', customer.name);
    this.search.perform(this.filter);
  }

  @restartableTask
  *search(filter) {
    this.orders = yield this.store.query('order', {
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      include: 'customer,offer',
      filter: {
        customer: {
          name: filter.name,
          'postal-code': filter.postalCode,
          city: filter.city,
          street: filter.street,
        },
        'request-number': filter.requestNumber,
        'offer-number': filter.offerNumber,
        reference: filter.reference,
      },
    });
  }
}

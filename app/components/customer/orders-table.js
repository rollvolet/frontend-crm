import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import onlyNumericChars from '../../utils/only-numeric-chars';

export default class CustomerOrdersTableComponent extends FilterComponent {
  @service router;
  @service store;

  @tracked orders = [];

  constructor() {
    super(...arguments);
    this.initFilter([
      'requestNumber',
      'visitor',
      'reference',
      'name',
      'postalCode',
      'city',
      'street',
    ]);
    this.sort = '-order-date';
    this.search.perform(this.filter);
  }

  onChange(filter) {
    if (this.page != 0) this.page = 0;
    this.search.perform(filter);
  }

  @restartableTask
  *search(filter) {
    this.orders = yield this.store.query('order', {
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      include: 'case.building.address.country,case.request.visitor',
      filter: {
        case: {
          customer: {
            ':uri:': this.args.customer.uri,
          },
          building: {
            name: filter.name,
            address: {
              street: filter.street,
              'postal-code': filter.postalCode,
              city: filter.city,
            },
          },
          request: {
            number: onlyNumericChars(filter.requestNumber),
            visitor: {
              'first-name': filter.visitor,
            },
          },
          reference: filter.reference,
        },
      },
    });
  }

  @action
  navigateToDetail(order) {
    this.router.transitionTo('main.orders.edit', order.id);
  }
}

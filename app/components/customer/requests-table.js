import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import onlyNumericChars from '../../utils/only-numeric-chars';

export default class CustomerRequestsTableComponent extends FilterComponent {
  @service router;
  @service store;

  @tracked requests = [];

  constructor() {
    super(...arguments);
    this.initFilter(['number', 'visitor', 'reference', 'name', 'postalCode', 'city', 'street']);
    this.sort = '-request-date';
    this.search.perform(this.filter);
  }

  // @overwrite
  onChange(filter) {
    if (this.page != 0) this.page = 0;
    this.search.perform(filter);
  }

  @restartableTask
  *search(filter) {
    this.requests = yield this.store.query('request', {
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      include: 'case.building.address.country',
      filter: {
        number: onlyNumericChars(filter.number),
        visitor: {
          'first-name': filter.visitor,
        },
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
          reference: filter.reference,
        },
      },
    });
  }

  @action
  navigateToDetail(request) {
    this.router.transitionTo('main.requests.edit', request.id);
  }
}

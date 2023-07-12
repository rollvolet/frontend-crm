import FilterComponent from '../data-table-filter';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import onlyNumericChars from '../../utils/only-numeric-chars';

export default class InterventionOrderSearchModalComponent extends FilterComponent {
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
    this.initSearch();
  }

  onChange(filter) {
    if (this.page != 0) this.page = 0;
    this.search.perform(filter);
  }

  async initSearch() {
    const _case = await this.args.model.case;
    const customer = await _case.customer;
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
      include: 'case.customer.address.country,case.request.visitor',
      filter: {
        case: {
          customer: {
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
}

import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import onlyNumericChars from '../../utils/only-numeric-chars';

export default class CustomerOffersTableComponent extends FilterComponent {
  @service router;
  @service store;

  @tracked offers = [];

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
    this.sort = '-offer-date';
    this.search.perform(this.filter);
  }

  // @overwrite
  onChange(filter) {
    if (this.page != 0) this.page = 0;
    this.search.perform(filter);
  }

  @restartableTask
  *search(filter) {
    this.offers = yield this.store.query('offer', {
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
  navigateToDetail(offer) {
    this.router.transitionTo('main.offers.edit', offer.id);
  }
}

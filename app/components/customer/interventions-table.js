import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import onlyNumericChars from '../../utils/only-numeric-chars';

export default class CustomerInterventionsTableComponent extends FilterComponent {
  @service router;
  @service store;

  @tracked interventions = [];

  constructor() {
    super(...arguments);
    this.initFilter(['number', 'name', 'postalCode', 'city', 'street']);
    this.sort = '-intervention-date';
    this.search.perform(this.filter);
  }

  // @overwrite
  onChange(filter) {
    if (this.page != 0) this.page = 0;
    this.search.perform(filter);
  }

  @restartableTask
  *search(filter) {
    this.interventions = yield this.store.query('intervention', {
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      include: 'case.building.address.country',
      filter: {
        number: onlyNumericChars(filter.number),
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
        },
      },
    });
  }

  @action
  navigateToDetail(intervention) {
    this.router.transitionTo('main.interventions.edit', intervention.id);
  }
}

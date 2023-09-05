import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { restartableTask } from 'ember-concurrency';
import onlyNumericChars from '../../utils/only-numeric-chars';

export default class OrderInterventionsTableComponent extends FilterComponent {
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

  get isEmptySearch() {
    return ['number', 'name', 'postalCode', 'city', 'street'].every((f) => isBlank(f));
  }

  get hasNoLinkedInterventions() {
    return this.interventions.length == 0 && this.isEmptySearch;
  }

  @restartableTask
  *search(filter) {
    this.interventions = yield this.store.query('intervention', {
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      include: 'case.customer',
      filter: {
        origin: {
          ':uri:': this.args.order.uri,
        },
        number: onlyNumericChars(filter.number),
        case: {
          customer: {
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

import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

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

  @restartableTask
  *search(filter) {
    this.interventions = yield this.store.query('intervention', {
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      include: 'customer',
      filter: {
        origin: {
          id: this.args.order.id,
        },
        number: filter.number,
        customer: {
          name: filter.name,
          'postal-code': filter.postalCode,
          city: filter.city,
          street: filter.street,
        },
      },
    });
  }

  @action
  navigateToDetail(intervention) {
    this.router.transitionTo('main.interventions.edit', intervention.id);
  }
}

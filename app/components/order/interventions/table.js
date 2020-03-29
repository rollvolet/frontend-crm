import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency-decorators';

export default class OrderInterventionsTableComponent extends FilterComponent {
  @service router
  @service store

  @tracked interventions = []

  constructor() {
    super(...arguments);
    this.initFilter(['number', 'name', 'postalCode', 'city', 'street']);
    this.filter.set('page', 0);
    this.filter.set('size', 10);
    this.filter.set('sort', '-date');

    // Setup observers for 2-way binded values of ember-data-table
    this.filter.addObserver('page', this, 'onDataTableParamChange'); // eslint-disable-line ember/no-observers
    this.filter.addObserver('size', this, 'onDataTableParamChange'); // eslint-disable-line ember/no-observers
    this.filter.addObserver('sort', this, 'onDataTableParamChange'); // eslint-disable-line ember/no-observers
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
    this.interventions = yield this.store.query('intervention', {
      page: {
        size: filter.size,
        number: filter.page
      },
      sort: filter.sort,
      include: 'customer',
      filter: {
        origin: {
          id: this.args.order.id
        },
        number: filter.number,
        customer: {
          name: filter.name,
          'postal-code': filter.postalCode,
          city: filter.city,
          street: filter.street
        }
      }
    });
  }

  @action
  clickRow(row) {
    const interventionId = row.get('id');
    this.router.transitionTo('main.interventions.edit', interventionId);
  }
}

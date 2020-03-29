import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency-decorators';

export default class InvoicesTable extends FilterComponent {
  @service router
  @service store

  @tracked invoices = []

  constructor() {
    super(...arguments);
    this.initFilter(['number', 'reference', 'name', 'postalCode', 'city', 'street']);
    this.filter.set('page', 0);
    this.filter.set('size', 10);
    this.filter.set('sort', '-number');

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
    this.invoices = yield this.store.query('invoice', {
      page: {
        size: filter.size,
        number: filter.page
      },
      sort: filter.sort,
      include: 'building',
      filter: {
        customer: {
          number: this.args.customer.number
        },
        number: filter.number,
        reference: filter.reference,
        building: {
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
    const invoiceId = row.get('id');
    this.router.transitionTo('main.case.invoice.edit', this.args.customer, invoiceId);
  }

  @action
  openNewInvoice() {
    this.router.transitionTo('main.case.invoice.new', this.args.customer);
  }
}

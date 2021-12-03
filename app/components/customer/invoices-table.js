import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

export default class InvoicesTable extends FilterComponent {
  @service router;
  @service store;

  @tracked page = 0;
  @tracked size = 10;
  @tracked sort = '-number';
  @tracked invoices = [];

  constructor() {
    super(...arguments);
    this.initFilter(['number', 'reference', 'name', 'postalCode', 'city', 'street']);
    this.search.perform(this.filter);
  }

  onChange(filter) {
    if (this.page != 0) this.page = 0;
    this.search.perform(filter);
  }

  @restartableTask
  *search(filter) {
    this.invoices = yield this.store.query('invoice', {
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      include: 'building',
      filter: {
        customer: {
          number: this.args.customer.number,
        },
        number: filter.number,
        reference: filter.reference,
        building: {
          name: filter.name,
          'postal-code': filter.postalCode,
          city: filter.city,
          street: filter.street,
        },
      },
    });
  }

  @action
  previousPage() {
    this.selectPage(this.page - 1);
  }

  @action
  nextPage() {
    this.selectPage(this.page + 1);
  }

  @action
  selectPage(page) {
    this.page = page;
    this.search.perform(this.filter);
  }

  @action
  setSort(sort) {
    this.sort = sort;
    this.search.perform(this.filter);
  }
}

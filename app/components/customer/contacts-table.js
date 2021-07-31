import { action } from '@ember/object';
import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency-decorators';

export default class ContactsTable extends FilterComponent {
  @service router;
  @service store;

  @tracked page = 0;
  @tracked size = 10;
  @tracked sort = 'name';
  @tracked contacts = [];

  constructor() {
    super(...arguments);
    this.initFilter(['number', 'name', 'postalCode', 'city', 'street', 'telephone']);
    this.search.perform(this.filter);
  }

  // @overwrite
  onChange(filter) {
    if (this.page != 0)
      this.page = 0;
    this.search.perform(filter);
  }

  @restartableTask
  *search(filter) {
    this.contacts = yield this.store.query('contact', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'country,language,honorific-prefix',
      filter: {
        customer: {
          number: this.args.customer.number
        },
        number: filter.number,
        name: filter.name,
        'postal-code': filter.postalCode,
        city: filter.city,
        street: filter.street,
        telephone: filter.telephone
      }
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

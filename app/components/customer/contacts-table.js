import classic from 'ember-classic-decorator';
import { observes } from '@ember-decorators/object';
import { inject as service } from '@ember/service';
import FilterComponent from '../data-table-filter';
import { task } from 'ember-concurrency';

@classic
export default class ContactsTable extends FilterComponent {
  @service store;

  page = 0;
  size = 10;
  sort = 'name';
  filterKeys = Object.freeze(['number', 'name', 'postalCode', 'city', 'street', 'telephone'])

  init() {
    super.init(...arguments);
    this.search.perform(this.getFilter());
  }

  async onChange(filter) {
    await this.search.perform(filter);
  }

  @observes('page', 'size', 'sort')
  dataTableParamChanged() { // eslint-disable-line ember/no-observers
    this.search.perform(this.getFilter());
  }

  @task(function * (filter) {
    const contacts = yield this.store.query('contact', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'country,language,honorific-prefix',
      filter: {
        customer: {
          number: this.customer.number
        },
        number: filter.number,
        name: filter.name,
        'postal-code': filter.postalCode,
        city: filter.city,
        street: filter.street,
        telephone: filter.telephone
      }
    });
    this.set('contacts', contacts);
  })
  search;
}

import FilterComponent from '../data-table-filter';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import onlyNumericChars from '../../utils/only-numeric-chars';

export default class ContactsTable extends FilterComponent {
  @service router;
  @service store;

  @tracked contacts = [];

  constructor() {
    super(...arguments);
    this.initFilter(['number', 'name', 'postalCode', 'city', 'street', 'telephone']);
    this.sort = 'position';
    this.search.perform(this.filter);
  }

  // @overwrite
  onChange(filter) {
    if (this.page != 0) this.page = 0;
    this.search.perform(filter);
  }

  @restartableTask
  *search(filter) {
    this.contacts = yield this.store.query('contact', {
      page: {
        size: this.size,
        number: this.page,
      },
      sort: this.sort,
      include: 'address.country,language',
      filter: {
        customer: {
          ':uri:': this.args.customer.uri,
        },
        position: onlyNumericChars(filter.number),
        name: filter.name,
        address: {
          street: filter.street,
          'postal-code': filter.postalCode,
          city: filter.city,
        },
        telephones: {
          value: onlyNumericChars(filter.telephone),
        },
      },
    });
  }
}

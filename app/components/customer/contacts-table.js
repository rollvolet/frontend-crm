import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { observes } from '@ember-decorators/object';
import { action } from '@ember/object';
import Component from '@ember/component';
import DebouncedSearch from '../../mixins/debounced-search-task';
import { task } from 'ember-concurrency';

@classic
@classNames('contacts-table')
export default class ContactsTable extends Component.extend(DebouncedSearch) {
  init() {
    super.init(...arguments);
    this.search.perform();
  }

  page = 0;
  size = 10;
  sort = 'name';
  onClickRow = null;
  onEdit = null;

  @observes('page', 'size', 'sort')
  dataTableParamChanged() { // eslint-disable-line ember/no-observers
    this.search.perform();
  }

  @task(function * () {
    const contacts = yield this.customer.query('contacts', {
      page: {
        size: this.size,
        number: this.page
      },
      sort: this.sort,
      include: 'country,language,honorific-prefix',
      filter: {
        number: this.getFilterValue('number'),
        name: this.getFilterValue('name'),
        'postal-code': this.getFilterValue('postalCode'),
        city: this.getFilterValue('city'),
        street: this.getFilterValue('street'),
        telephone: this.getFilterValue('telephone')
      }
    });
    this.set('contacts', contacts);
  })
  search;

  @action
  setFilter(key, value) {
    this.set(key, value);
    this.debounceSearch.perform(this.search);
  }

  @action
  resetFilters() {
    this.set('number', undefined);
    this.set('name', undefined);
    this.set('postalCode', undefined);
    this.set('city', undefined);
    this.set('street', undefined);
    this.set('telephone', undefined);
    this.search.perform();
  }

  @action
  edit(contact) {
    this.onEdit(contact);
  }
}

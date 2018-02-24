import Component from '@ember/component';
import DebouncedSearch from '../mixins/debounced-search-task';
import { task } from 'ember-concurrency';
import { observer } from '@ember/object';

export default Component.extend(DebouncedSearch, {
  classNames: ['contacts-table'],
  init() {
    this._super(...arguments);
    this.get('search').perform();
  },
  page: 0,
  size: 10,
  sort: 'name',
  dataTableParamChanged: observer('page', 'size', 'sort', function() {
    this.get('search').perform();
  }),
  search: task(function * () {
    const contacts = yield this.get('customer').query('contacts', {
      page: {
        size: this.get('size'),
        number: this.get('page')
      },
      sort: this.get('sort'),
      include: 'country,language,honorific-prefix',
      filter: {
        number: this.get('number'),
        name: this.get('name'),
        'postal-code': this.get('postalCode'),
        city: this.get('city'),
        street: this.get('street'),
        telephone: this.get('telephone')
      }
    });
    this.set('contacts', contacts);
  }),
  actions: {
    setFilter(key, value) {
      this.set(key, value);
      this.get('debounceSearch').perform(this.get('search'));
    },
    resetFilters() {
      this.set('number', undefined);
      this.set('name', undefined);
      this.set('postalCode', undefined);
      this.set('city', undefined);
      this.set('street', undefined);
      this.set('telephone', undefined);
      this.get('search').perform();
    },
    selectContact(contact) {
      this.set('selectedContact', contact);
    },
    deselectContact() {
      this.set('selectedContact', null);
    }
  }
});

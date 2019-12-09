import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import DebouncedSearch from '../../../mixins/debounced-search-task';
import { oneWay } from '@ember/object/computed';

export default Controller.extend(DefaultQueryParams, DebouncedSearch, {
  size: 25,

  numberFilter: oneWay('number'),
  nameFilter: oneWay('name'),
  postalCodeFilter: oneWay('postalCode'),
  cityFilter: oneWay('city'),
  streetFilter: oneWay('street'),
  telephoneFilter: oneWay('telephone'),

  actions: {
    clickRow(row) {
      this.transitionToRoute('main.customers.edit', row);
    },
    setFilter(key, value) {
      this.set(`${key}Filter`, value);
      this.debounceFilter.perform(key, value);
    },
    resetFilters() {
      [
        'numberFilter', 'number',
        'nameFilter', 'name',
        'postalCodeFilter', 'postalCode',
        'cityFilter', 'city',
        'streetFilter', 'street',
        'telephoneFilter', 'telephone'
      ].forEach(x => this.set(x, undefined));
      document.querySelector('.search-autofocus input').focus();
    }
  }
});

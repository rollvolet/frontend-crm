import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import { task, timeout } from 'ember-concurrency';
import { oneWay } from '@ember/object/computed';

export default Controller.extend(DefaultQueryParams, {
  size: 25,
  numberFilter: oneWay('number'),
  nameFilter: oneWay('name'),
  postalCodeFilter: oneWay('postalCode'),
  cityFilter: oneWay('city'),
  streetFilter: oneWay('street'),
  debounceQueryParam: task(function * (key, value) {
    yield timeout(500);
    yield this.set(key, value);
  }).restartable(),
  actions: {
    clickRow(row) {
      this.transitionToRoute('main.customers.edit', row);
    },
    setFilter(key, value) {
      this.set(`${key}Filter`, value);
      this.get('debounceQueryParam').perform(key, value);
    },
    resetFilters() {
      this.set('numberFilter', undefined);
      this.set('nameFilter', undefined);
      this.set('postalCodeFilter', undefined);
      this.set('cityFilter', undefined);
      this.set('streetFilter', undefined);
      this.set('number', undefined);
      this.set('name', undefined);
      this.set('postalCode', undefined);
      this.set('city', undefined);
      this.set('street', undefined);
    }
  }
});

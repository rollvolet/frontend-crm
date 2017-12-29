import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import { task, timeout } from 'ember-concurrency';
import { oneWay } from '@ember/object/computed';

export default Controller.extend(DefaultQueryParams, {
  size: 25,
  sort: '-request-date',

  numberFilter: oneWay('number'),
  cNameFilter: oneWay('cName'),
  cPostalCodeFilter: oneWay('cPostalCode'),
  cCityFilter: oneWay('cCity'),
  cStreetFilter: oneWay('cStreet'),
  cTelephoneFilter: oneWay('cTelephone'),
  bNameFilter: oneWay('bName'),
  bPostalCodeFilter: oneWay('bPostalCode'),
  bCityFilter: oneWay('bCity'),
  bStreetFilter: oneWay('bStreet'),

  debounceQueryParam: task(function * (key, value) {
    yield timeout(500);
    yield this.set(key, value);
  }).restartable(),

  actions: {
    clickRow(row) {
      const customerId = row.get('customer.id');
      const requestId = row.get('id');
      this.transitionToRoute('main.case.request', customerId, requestId);
    },
    setFilter(key, value) {
      this.set(`${key}Filter`, value);
      this.get('debounceQueryParam').perform(key, value);
    },
    resetFilters() {
      [
        'numberFilter', 'number',
        'cNameFilter', 'cName',
        'cPostalCodeFilter', 'cPostalCode',
        'cCityFilter', 'cCity',
        'cStreetFilter', 'cStreet',
        'cTelephoneFilter', 'cTelephone',
        'bNameFilter', 'bName',
        'bPostalCodeFilter', 'bPostalCode',
        'bCityFilter', 'bCity',
        'bStreetFilter', 'bStreet'
      ].forEach(x => this.set(x, undefined));
    }
  }
});

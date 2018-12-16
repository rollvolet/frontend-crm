import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import DebouncedSearch from '../../../mixins/debounced-search-task';
import { oneWay } from '@ember/object/computed';

export default Controller.extend(DefaultQueryParams, DebouncedSearch, {
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
  withoutOffer: false,

  actions: {
    clickRow(row) {
      const customerId = row.get('customer.id');
      const requestId = row.get('id');
      if (customerId)
        this.transitionToRoute('main.case.request.edit', customerId, requestId);
      else
        this.transitionToRoute('main.requests.edit', requestId);
    },
    setFilter(key, value) {
      this.set(`${key}Filter`, value);
      this.debounceFilter.perform(key, value);
    },
    resetFilters() {
      this.set('withoutOffer', false);
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

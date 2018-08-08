import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import DebouncedSearch from '../../../mixins/debounced-search-task';
import { oneWay } from '@ember/object/computed';

export default Controller.extend(DefaultQueryParams, DebouncedSearch, {
  size: 25,
  sort: '-offer-date',

  numberFilter: oneWay('number'),
  referenceFilter: oneWay('reference'),
  reqNumberFilter: oneWay('reqNumber'),
  cNameFilter: oneWay('cName'),
  cPostalCodeFilter: oneWay('cPostalCode'),
  cCityFilter: oneWay('cCity'),
  cStreetFilter: oneWay('cStreet'),
  cTelephoneFilter: oneWay('cTelephone'),
  bNameFilter: oneWay('bName'),
  bPostalCodeFilter: oneWay('bPostalCode'),
  bCityFilter: oneWay('bCity'),
  bStreetFilter: oneWay('bStreet'),
  withoutOrder: false,

  actions: {
    clickRow(row) {
      const customerId = row.get('customer.id');
      const offerId = row.get('id');
      this.transitionToRoute('main.case.offer.edit', customerId, offerId);
    },
    setFilter(key, value) {
      this.set(`${key}Filter`, value);
      this.debounceFilter.perform(key, value);
    },
    resetFilters() {
      this.set('withoutOrder', false);
      [
        'numberFilter', 'number',
        'referenceFilter', 'reference',
        'reqNumberFilter', 'reqNumber',
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

import Controller from '@ember/controller';
import DefaultQueryParams from 'ember-data-table/mixins/default-query-params';
import DebouncedSearch from '../../../mixins/debounced-search-task';
import { oneWay } from '@ember/object/computed';

export default Controller.extend(DefaultQueryParams, DebouncedSearch, {
  size: 25,
  sort: '-order-date',

  requestNumberFilter: oneWay('requestNumber'),
  offerNumberFilter: oneWay('offerNumber'),
  referenceFilter: oneWay('reference'),
  cNameFilter: oneWay('cName'),
  cPostalCodeFilter: oneWay('cPostalCode'),
  cCityFilter: oneWay('cCity'),
  cStreetFilter: oneWay('cStreet'),
  cTelephoneFilter: oneWay('cTelephone'),
  bNameFilter: oneWay('bName'),
  bPostalCodeFilter: oneWay('bPostalCode'),
  bCityFilter: oneWay('bCity'),
  bStreetFilter: oneWay('bStreet'),
  withoutInvoice: false,

  actions: {
    clickRow(row) {
      const customerId = row.get('customer.id');
      const orderId = row.get('id');
      this.transitionToRoute('main.case.order.edit', customerId, orderId);
    },
    setFilter(key, value) {
      this.set(`${key}Filter`, value);
      this.debounceFilter.perform(key, value);
    },
    resetFilters() {
      this.set('withoutInvoice', false);
      [
        'requestNumberFilter', 'requestNumber',
        'offerNumberFilter', 'offerNumber',
        'referenceFilter', 'reference',
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

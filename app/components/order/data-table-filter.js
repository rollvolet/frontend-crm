import FilterComponent from '../data-table-filter';
import { action } from '@ember/object';

export default class DataFilterComponent extends FilterComponent {
  constructor() {
    super(...arguments);
    super.initFilter([
      'offerNumber',
      'reference',
      'visitor',
      'requestNumber',
      'cName',
      'cPostalCode',
      'cCity',
      'cStreet',
      'cTelephone',
      'bName',
      'bPostalCode',
      'bCity',
      'bStreet',
      'hasInvoice',
      'isCancelled',
    ]);
  }

  @action
  resetFilters() {
    this.filterKeys.forEach((key) => this.filter.set(key, undefined));
    this.filter.set('hasInvoice', 0);
    this.filter.set('isCancelled', 0);
    this.onChange(this.filter);
  }
}

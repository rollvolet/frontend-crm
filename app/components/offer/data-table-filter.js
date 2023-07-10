import FilterComponent from '../data-table-filter';
import { action } from '@ember/object';

export default class OfferDataTableFilterComponent extends FilterComponent {
  constructor() {
    super(...arguments);
    super.initFilter([
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
      'hasOrder',
      'isCancelled',
    ]);
  }

  @action
  resetFilters() {
    this.filterKeys.forEach((key) => this.filter.set(key, undefined));
    this.filter.set('hasOrder', -1);
    this.filter.set('isCancelled', 0);
    this.onChange(this.filter);
  }
}

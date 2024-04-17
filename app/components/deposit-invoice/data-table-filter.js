import FilterComponent from '../data-table-filter';
import { action } from '@ember/object';

export default class DepositInvoiceDataTableFilterComponent extends FilterComponent {
  constructor() {
    super(...arguments);
    super.initFilter([
      'number',
      'reference',
      'requestNumber',
      'name',
      'postalCode',
      'city',
      'street',
      'telephone',
      'isCancelled',
    ]);
  }

  @action
  resetFilters() {
    this.filterKeys.forEach((key) => this.filter.set(key, undefined));
    this.filter.set('isCancelled', -1);
    this.onChange(this.filter);
  }
}

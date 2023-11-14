import FilterComponent from '../data-table-filter';
import { action } from '@ember/object';

export default class OrderDataTableFilterComponent extends FilterComponent {
  constructor() {
    super(...arguments);
    super.initFilter([
      'reference',
      'visitor',
      'requestNumber',
      'name',
      'postalCode',
      'city',
      'street',
      'telephone',
      'hasInvoice',
      'isCancelled',
    ]);
  }

  @action
  resetFilters() {
    this.filterKeys.forEach((key) => this.filter.set(key, undefined));
    this.filter.set('hasInvoice', -1);
    this.filter.set('isCancelled', 0);
    this.onChange(this.filter);
  }
}

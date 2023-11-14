import FilterComponent from '../data-table-filter';
import { action } from '@ember/object';

export default class InterventionDataTableFilterComponent extends FilterComponent {
  constructor() {
    super(...arguments);
    super.initFilter([
      'number',
      'reference',
      'name',
      'postalCode',
      'city',
      'street',
      'telephone',
      'hasInvoice',
      'isCancelled',
      'isPlanned',
    ]);
  }

  @action
  resetFilters() {
    this.filterKeys.forEach((key) => this.filter.set(key, undefined));
    this.filter.set('hasInvoice', 0);
    this.filter.set('isCancelled', 0);
    this.filter.set('isPlanned', -1);
    this.onChange(this.filter);
  }
}

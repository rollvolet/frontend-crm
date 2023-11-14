import FilterComponent from '../data-table-filter';
import { action } from '@ember/object';

export default class RequestDataTableFilterComponent extends FilterComponent {
  constructor() {
    super(...arguments);
    super.initFilter([
      'number',
      'visitor',
      'reference',
      'name',
      'postalCode',
      'city',
      'street',
      'telephone',
      'hasOffer',
      'isCancelled',
    ]);
  }

  @action
  resetFilters() {
    this.filterKeys.forEach((key) => this.filter.set(key, undefined));
    this.filter.set('hasOffer', -1);
    this.filter.set('isCancelled', 0);
    this.onChange(this.filter);
  }
}

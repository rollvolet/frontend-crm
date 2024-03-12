import FilterComponent from '../data-table-filter';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

export default class CustomerDataFilterComponent extends FilterComponent {
  constructor() {
    super(...arguments);
    super.initFilter([
      'number',
      'name',
      'postalCode',
      'city',
      'street',
      'telephone',
      'keyword',
      'onlyActive',
    ]);
  }

  @action
  resetFilters() {
    const isActiveFilterField = isPresent(this.filter['onlyActive']);
    this.filterKeys.forEach((key) => this.filter.set(key, undefined));
    if (isActiveFilterField) {
      this.filter.set('onlyActive', true);
    }
    this.onChange(this.filter);
  }
}

import FilterComponent from '../data-table-filter';
import { action } from '@ember/object';

export default class DataFilterComponent extends FilterComponent {
  constructor() {
    super(...arguments);
    super.initFilter([
      'number',
      'visitor',
      'cName',
      'cPostalCode',
      'cCity',
      'cStreet',
      'cTelephone',
      'bName',
      'bPostalCode',
      'bCity',
      'bStreet',
      'hasOffer',
    ]);
  }

  @action
  resetFilters() {
    this.filterKeys.forEach((key) => this.filter.set(key, undefined));
    this.filter.set('hasOffer', 0);
    this.onChange(this.filter);
  }
}

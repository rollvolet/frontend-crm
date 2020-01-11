import FilterComponent from '../data-table-filter';
import classic from 'ember-classic-decorator';

@classic
export default class DataFilterComponent extends FilterComponent {
  filterKeys = Object.freeze(['number', 'name', 'postalCode', 'city', 'street', 'telephone'])
}

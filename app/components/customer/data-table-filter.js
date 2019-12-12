import FilterComponent from '../data-table-filter';

export default FilterComponent.extend({
  filterKeys: Object.freeze(['number', 'name', 'postalCode', 'city', 'street', 'telephone']),
});

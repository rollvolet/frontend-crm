import FilterComponent from '../data-table-filter';

export default FilterComponent.extend({
  filterKeys: Object.freeze(['number', 'cName', 'cPostalCode', 'cCity', 'cStreet', 'cTelephone', 'bName', 'bPostalCode', 'bCity', 'bStreet', 'withoutOffer']),
});

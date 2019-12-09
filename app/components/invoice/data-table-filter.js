import FilterComponent from '../data-table-filter';

export default FilterComponent.extend({
  filterKeys: Object.freeze(['number', 'reference', 'offerNumber', 'requestNumber', 'cName', 'cPostalCode', 'cCity', 'cStreet', 'cTelephone', 'bName', 'bPostalCode', 'bCity', 'bStreet']),
});

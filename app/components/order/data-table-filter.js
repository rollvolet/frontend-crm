import FilterComponent from '../data-table-filter';

export default FilterComponent.extend({
  filterKeys: Object.freeze(['offerNumber', 'reference', 'visitor', 'requestNumber', 'cName', 'cPostalCode', 'cCity', 'cStreet', 'cTelephone', 'bName', 'bPostalCode', 'bCity', 'bStreet', 'withoutInvoice']),
});

import FilterComponent from '../data-table-filter';

export default class DataFilterComponent extends FilterComponent {
  constructor() {
    super(...arguments);
    super.initFilter([
      'number',
      'reference',
      'visitor',
      'requestNumber',
      'cName',
      'cPostalCode',
      'cCity',
      'cStreet',
      'cTelephone',
      'bName',
      'bPostalCode',
      'bCity',
      'bStreet',
      'withoutOrder',
    ]);
  }
}

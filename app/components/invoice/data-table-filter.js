import FilterComponent from '../data-table-filter';
import classic from 'ember-classic-decorator';

@classic
export default class DataFilterComponent extends FilterComponent {
  filterKeys = Object.freeze(['number', 'reference', 'offerNumber', 'requestNumber', 'cName', 'cPostalCode', 'cCity', 'cStreet', 'cTelephone', 'bName', 'bPostalCode', 'bCity', 'bStreet'])
}

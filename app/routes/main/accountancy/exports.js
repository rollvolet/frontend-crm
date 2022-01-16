import DataTableRoute from '../../../utils/data-table-route';
import { action } from '@ember/object';

export default class MainAccountancyExportsRoute extends DataTableRoute {
  modelName = 'accountancy-export';

  @action
  refreshModel() {
    this.refresh();
  }
}

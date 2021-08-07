import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import { action } from '@ember/object';

export default class ExportsRoute extends Route.extend(DataTableRouteMixin) {
  modelName = 'accountancy-export';

  @action
  refreshModel() {
    this.refresh();
  }
}

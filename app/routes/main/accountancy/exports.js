import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import { action } from '@ember/object';

export default class ExportsRoute extends Route.extend(DataTableRouteMixin) {
  modelName = 'accountancy-export';

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.isInvoicesExpanded = false;
    controller.isHistoryExpanded = true;
  }

  @action
  refreshModel() {
    this.refresh();
  }
}

import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

@classic
export default class ExportsRoute extends Route.extend(DataTableRouteMixin) {
  modelName = 'accountancy-export';

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('isInvoicesExpanded', false);
    controller.set('isHistoryExpanded', true);
  }

  @action
  refreshModel() {
    this.refresh();
  }
}

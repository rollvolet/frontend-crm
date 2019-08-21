import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default Route.extend(DataTableRouteMixin, {
  modelName: 'accountancy-export',

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('isInvoicesExpanded', false);
    controller.set('isHistoryExpanded', true);
  },

  actions: {
    refreshModel() {
      this.refresh();
    }
  }
});

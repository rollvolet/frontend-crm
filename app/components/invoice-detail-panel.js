import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  documentGeneration: service(),

  model: null,
  showWorkingHoursDialog: false,

  actions: {
    openWorkingHoursDialog() {
      this.set('showWorkingHoursDialog', true);
    },
    async downloadProductionTicket() {
      const order = await this.model.order;
      this.documentGeneration.downloadProductionTicket(order);
    }
  }
});

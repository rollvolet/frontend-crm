import Component from '@ember/component';
import { neq, sum, mapBy, raw } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';

export default Component.extend({
  router: service(),
  documentGeneration: service(),

  model: null,

  depositsAmount: sum(mapBy('model.deposits', raw('amount'))),
  depositInvoicesAmount: sum(mapBy('model.depositInvoices', raw('arithmeticAmount'))),
  isNbOfPersonsWarning: neq('model.scheduledNbOfPersons', raw(2)),
  showProductionTicketNotFoundDialog: false,

  actions: {
    goToDepositInvoices() {
      const order = this.model;
      this.router.transitionTo('main.case.order.edit.deposit-invoices', order);
    },
    async downloadProductionTicket() {
      const document = await this.documentGeneration.downloadProductionTicket(this.model);

      if (!document)
        this.set('showProductionTicketNotFoundDialog', true);
    }
  }
});

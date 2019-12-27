import Component from '@ember/component';
import { neq, sum, array, raw } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';

export default Component.extend({
  router: service(),

  model: null,

  depositsAmount: sum(array.mapBy('model.deposits', raw('amount'))),
  depositInvoicesAmount: sum(array.mapBy('model.depositInvoices', raw('arithmeticAmount'))),
  isNbOfPersonsWarning: neq('model.scheduledNbOfPersons', raw(2)),

  actions: {
    goToDepositInvoices() {
      const order = this.model;
      this.router.transitionTo('main.case.order.edit.deposit-invoices', order);
    }
  }
});

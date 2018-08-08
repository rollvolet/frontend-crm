import Controller from '@ember/controller';
import { mapBy } from 'ember-awesome-macros/array';
import { sum } from 'ember-awesome-macros';
import raw from 'ember-macro-helpers/raw';

export default Controller.extend({
  showDepositsDialog: false,
  depositsAmount: sum(mapBy('model.deposits', raw('amount'))),
  depositInvoicesAmount: sum(mapBy('model.depositInvoices', raw('arithmeticAmount'))),
  actions: {
    closeDepositsDialog() {
      this.set('showDepositsDialog', false);
    },
    openDepositsDialog() {
      this.set('showDepositsDialog', true);
    },
    goToDepositInvoices() {
      const order = this.model;
      this.transitionToRoute('main.case.order.edit.deposit-invoices', order);
    }
  }
});

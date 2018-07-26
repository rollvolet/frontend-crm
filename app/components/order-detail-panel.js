import Component from '@ember/component';
import { mapBy } from 'ember-awesome-macros/array';
import { sum } from 'ember-awesome-macros';
import raw from 'ember-macro-helpers/raw';
import { inject as service } from '@ember/service';

export default Component.extend({
  router: service(),

  model: null,
  showDepositsDialog: false,
  onCreateNewDeposit: null,

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
      const order = this.get('model');
      this.router.transitionTo('main.case.order.edit.deposit-invoices', order);
    }
  }
});

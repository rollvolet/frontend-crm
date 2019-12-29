import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { neq, sum, array, raw } from 'ember-awesome-macros';

@classic
export default class OrderDetailPanel extends Component {
  @service
  router;

  model = null;

  @sum(array.mapBy('model.deposits', raw('amount')))
  depositsAmount;

  @sum(array.mapBy('model.depositInvoices', raw('arithmeticAmount')))
  depositInvoicesAmount;

  @neq('model.scheduledNbOfPersons', raw(2))
  isNbOfPersonsWarning;

  @action
  goToDepositInvoices() {
    const order = this.model;
    this.router.transitionTo('main.case.order.edit.deposit-invoices', order);
  }
}

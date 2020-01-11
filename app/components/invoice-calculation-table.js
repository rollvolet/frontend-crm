import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { oneWay } from '@ember/object/computed';
import Component from '@ember/component';
import { add, product, quotient, subtract, sum, raw, array, promise } from 'ember-awesome-macros';

@classic
export default class InvoiceCalculationTable extends Component {
  showSupplementsDialog = false;

  @quotient('model.vatRate.rate', 100)
  vatRate;

  @oneWay('model.baseAmount')
  baseAmount;

  @product('baseAmount', 'vatRate')
  baseAmountVat;

  @oneWay('model.supplements')
  supplementsPromise

  @promise.array('supplementsPromise')
  supplements

  @sum(array.mapBy('supplements', raw('amount')))
  supplementsAmount;

  @product('supplementsAmount', 'vatRate')
  supplementsVat;

  @add('model.baseAmount', 'supplementsAmount')
  totalOrderAmount;

  @product('totalOrderAmount', 'vatRate')
  totalOrderVat;

  @oneWay('model.depositInvoices')
  depositInvoicesPromise

  @promise.array('depositInvoicesPromise')
  depositInvoices

  @sum(array.mapBy('depositInvoices', raw('arithmeticAmount')))
  depositInvoicesAmount;

  // assumption that all deposit invoices have the same vat rate as the parent invoice
  @product('depositInvoicesAmount', 'vatRate')
  depositInvoicesVat;

  @subtract('totalOrderAmount', 'depositInvoicesAmount')
  totalNetAmount;

  @subtract('totalOrderVat', 'depositInvoicesVat')
  totalVat;

  @sum('totalNetAmount', 'totalVat')
  totalGrossAmount;

  @oneWay('model.deposits')
  depositsPromise

  @promise.array('depositsPromise')
  deposits

  @sum(array.mapBy('deposits', raw('amount')))
  depositsAmount;

  @subtract('totalGrossAmount', 'depositsAmount')
  totalToPay;

  @action
  openSupplementsDialog() {
    this.set('showSupplementsDialog', true);
  }
}

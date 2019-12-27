import Component from '@ember/component';
import { oneWay } from '@ember/object/computed';
import { add, product, quotient, subtract, sum, raw, array } from 'ember-awesome-macros';

export default Component.extend({
  showSupplementsDialog: false,
  vatRate: quotient('model.vatRate.rate', 100),
  baseAmount: oneWay('model.baseAmount'),
  baseAmountVat: product('baseAmount', 'vatRate'),
  supplementsAmount: sum(array.mapBy('model.supplements', raw('amount'))),
  supplementsVat: product('supplementsAmount', 'vatRate'),
  totalOrderAmount: add('model.baseAmount', 'supplementsAmount'),
  totalOrderVat: product('totalOrderAmount', 'vatRate'),
  depositInvoicesAmount: sum(array.mapBy('model.depositInvoices', raw('arithmeticAmount'))),
  // assumption that all deposit invoices have the same vat rate as the parent invoice
  depositInvoicesVat: product('depositInvoicesAmount', 'vatRate'),
  totalNetAmount: subtract('totalOrderAmount', 'depositInvoicesAmount'),
  totalVat: subtract('totalOrderVat', 'depositInvoicesVat'),
  totalGrossAmount: sum('totalNetAmount', 'totalVat'),
  depositsAmount: sum(array.mapBy('model.deposits', raw('amount'))),
  totalToPay: subtract('totalGrossAmount', 'depositsAmount'),
  actions: {
    openSupplementsDialog() {
      this.set('showSupplementsDialog', true);
    }
  }
});

import Component from '@ember/component';
import { oneWay } from '@ember/object/computed';
import { add, product, quotient, subtract, sum, raw, mapBy } from 'ember-awesome-macros';

export default Component.extend({
  showSupplementsDialog: false,
  vatRate: quotient('model.vatRate.rate', 100),
  baseAmount: oneWay('model.baseAmount'),
  baseAmountVat: product('baseAmount', 'vatRate'),
  supplementsAmount: sum(mapBy('model.supplements', raw('amount'))),
  supplementsVat: product('supplementsAmount', 'vatRate'),
  totalOrderAmount: add('model.baseAmount', 'supplementsAmount'),
  totalOrderVat: product('totalOrderAmount', 'vatRate'),
  depositInvoicesAmount: sum(mapBy('model.depositInvoices', raw('arithmeticAmount'))),
  // assumption that all deposit invoices have the same vat rate as the parent invoice
  depositInvoicesVat: product('depositInvoicesAmount', 'vatRate'),
  depositsAmount: sum(mapBy('model.deposits', raw('amount'))),
  totalNetAmount: subtract('totalOrderAmount', 'depositInvoicesAmount', 'depositsAmount'),
  totalVat: subtract('totalOrderVat', 'depositInvoicesVat'),
  grossTotalAmount: sum('totalNetAmount', 'totalVat'),
  actions: {
    openSupplementsDialog() {
      this.set('showSupplementsDialog', true);
    }
  }
});

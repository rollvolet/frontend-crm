import Component from '@ember/component';
import { oneWay } from '@ember/object/computed';
import { mapBy } from 'ember-awesome-macros/array';
import {
  add,
  product,
  quotient,
  subtract,
  sum
} from 'ember-awesome-macros';
import raw from 'ember-macro-helpers/raw';

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

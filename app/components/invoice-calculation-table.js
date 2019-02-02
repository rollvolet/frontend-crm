import Component from '@ember/component';
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
  supplementsAmount: sum(mapBy('model.supplements', raw('amount'))),
  depositInvoicesAmount: sum(mapBy('model.depositInvoices', raw('arithmeticAmount'))),
  subtotalAmount: subtract(add('model.baseAmount', 'supplementsAmount'), 'depositInvoicesAmount'),
  depositsAmount: sum(mapBy('model.deposits', raw('amount'))),
  totalNetAmount: subtract('subtotalAmount', 'depositsAmount'),
  vatRate: quotient('model.vatRate.rate', 100),
  baseAmountVat: product('model.baseAmount', 'vatRate'),
  supplementsVat: product('supplementsAmount', 'vatRate'),
  // assumption that all deposit invoices have the same vat rate as the parent invoice
  depositInvoicesVat: product('depositInvoicesAmount', 'vatRate'),
  subtotalVat: product('subtotalAmount', 'vatRate'),
  grossTotalAmount: subtract(sum('subtotalAmount', 'subtotalVat'), 'depositsAmount'),
  actions: {
    openSupplementsDialog() {
      this.set('showSupplementsDialog', true);
    }
  }
});

import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { mapBy } from 'ember-awesome-macros/array';
import { add, product, quotient, subtract, sum } from 'ember-awesome-macros';
import raw from 'ember-macro-helpers/raw';

export default Component.extend({
  tagName: 'table',
  classNames: ['invoice-calculation-table'],
  supplementsAmount: sum(mapBy('model.supplements', raw('amount'))),
  depositInvoicesAmount: sum(mapBy('model.depositInvoices', raw('amount'))),
  subtotalAmount: subtract(add('model.baseAmount', 'supplementsAmount'), 'depositInvoicesAmount'),
  depositsAmount: sum(mapBy('model.deposits', raw('amount'))),
  totalNetAmount: subtract('subtotalAmount', 'depositsAmount'),
  vatRate: quotient('model.vatRate.rate', 100),
  grossFactor: quotient(sum(100, 'model.vatRate.rate'), 100),
  supplementsVat: product('supplementsAmount', 'vatRate'),
  depositInvoicesVat: product('depositInvoicesAmount', 'vatRate'),
  subtotalVat: product('subtotalAmount', 'vatRate'),
  grossTotalAmount: subtract(sum('subtotalAmount', 'subtotalVat'), 'depositsAmount')
});

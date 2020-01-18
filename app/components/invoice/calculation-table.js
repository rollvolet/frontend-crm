import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import sum from '../../utils/math/sum';

export default class InvoiceCalculationTableComponent extends Component {
  @tracked showSupplementsDialog = false;

  get vatPercentage() {
    return this.args.model.vatRate.get('rate') / 100;
  }

  get baseAmount() {
    return this.args.model.baseAmount;
  }

  get baseAmountVat() {
    return this.baseAmount * this.vatPercentage;
  }

  // TODO replace with Loadable mixin of Ember Data storefront
  // See https://emberigniter.com/guide-promises-computed-properties/
  @computed('args.model.invoicelines.@each.order.content')
  get supplementaryInvoicelines() {
    return this.args.model.invoicelines.filterBy('order.content', null);
  }

  get supplementsAmount() {
    const invoicelines = sum(this.supplementaryInvoicelines.mapBy('arithmeticAmount'));
    const supplements = sum(this.args.model.supplements.mapBy('amount'));
    return invoicelines + supplements;
  }

  get supplementsVat() {
    return this.supplementsAmount * this.vatPercentage;
  }

  get totalOrderAmount() {
    return this.baseAmount + this.supplementsAmount;
  }

  get totalOrderVat() {
    return this.totalOrderAmount * this.vatPercentage;
  }

  get depositInvoicesAmount() {
    return sum(this.args.model.depositInvoices.mapBy('arithmeticAmount'));
  }

  get depositInvoicesVat() {
    // assumption that all deposit invoices have the same vat rate as the parent invoice
    return this.depositInvoicesAmount * this.vatPercentage;
  }

  get totalNetAmount() {
    return this.totalOrderAmount - this.depositInvoicesAmount;
  }

  get totalVat() {
    return this.totalOrderVat - this.depositInvoicesVat;
  }

  get totalGrossAmount() {
    return this.totalNetAmount + this.totalVat;
  }

  get depositsAmount() {
    return sum(this.args.model.deposits.mapBy('amount'));
  }

  get totalToPay() {
    return this.totalGrossAmount - this.depositsAmount;
  }

  @action
  openSupplementsDialog() {
    this.showSupplementsDialog = true;
  }
}

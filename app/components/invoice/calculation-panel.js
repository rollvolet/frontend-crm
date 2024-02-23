import Component from '@glimmer/component';
import { service } from '@ember/service';
import { trackedFunction } from 'ember-resources/util/function';
import sum from '../../utils/math/sum';

export default class InvoiceCalculationPanelComponent extends Component {
  @service router;
  @service store;

  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  vatRateData = trackedFunction(this, async () => {
    return await this.case?.vatRate;
  });

  depositInvoicesData = trackedFunction(this, async () => {
    return this.case ? await this.case.depositInvoices : [];
  });

  get isLoading() {
    return this.case == null || this.vatRate == null || this.depositInvoicesData == null;
  }

  get case() {
    return this.caseData.value;
  }

  get vatRate() {
    return this.vatRateData.value;
  }

  get vatPercentage() {
    return this.vatRate && this.vatRate.rate / 100;
  }

  get totalOrderAmount() {
    // in case of Access a fixed number, otherwise the sum of the invoicelines
    return this.args.model.totalAmountNet;
  }

  get totalOrderVat() {
    return this.totalOrderAmount * this.vatPercentage;
  }

  get depositInvoicesAmount() {
    const depositInvoices = this.depositInvoicesData.value || [];
    const amounts = depositInvoices.map((invoice) => invoice.arithmeticAmount);
    return sum(amounts);
  }

  get depositInvoicesVat() {
    // assumption that all deposit invoices have the same vat rate as the parent invoice
    return this.depositInvoicesAmount * this.vatPercentage;
  }

  get paymentAmountNet() {
    return this.totalOrderAmount - this.depositInvoicesAmount;
  }

  get paymentVat() {
    return this.totalOrderVat - this.depositInvoicesVat;
  }

  get paymentAmountGross() {
    return this.paymentAmountNet + this.paymentVat;
  }

  get depositsAmount() {
    return this.args.model.paidDeposits || 0.0;
  }

  get totalToPay() {
    return this.paymentAmountGross - this.depositsAmount;
  }
}

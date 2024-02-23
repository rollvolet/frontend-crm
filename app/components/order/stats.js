import Component from '@glimmer/component';
import sum from '../../utils/math/sum';
import { trackedFunction } from 'ember-resources/util/function';

export default class OrderStatsComponent extends Component {
  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  vatRateData = trackedFunction(this, async () => {
    return await this.case?.vatRate;
  });

  depositInvoicesData = trackedFunction(this, async () => {
    return await this.case?.depositInvoices;
  });

  depositsAmountData = trackedFunction(this, async () => {
    const invoice = await this.case?.invoice;
    return invoice?.paidDeposits;
  });

  get case() {
    return this.caseData.value;
  }

  get vatRate() {
    return this.vatRateData.value;
  }

  get depositsAmount() {
    return this.depositsAmountData.value || 0.0;
  }

  get totalAmount() {
    return sum(this.args.invoicelines.map((line) => line.arithmeticAmount));
  }

  get vatPercentage() {
    return this.vatRate && this.vatRate.rate / 100;
  }

  get totalVat() {
    // assumption that all invoicelines have the same vatRate as the order
    return this.totalAmount * this.vatPercentage;
  }

  get depositInvoicesAmount() {
    const depositInvoices = this.depositInvoicesData.value || [];
    const amounts = depositInvoices.map((invoice) => invoice.arithmeticAmount);
    return sum(amounts);
  }
}

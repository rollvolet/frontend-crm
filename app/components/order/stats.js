import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import sum from '../../utils/math/sum';
import { trackedFunction } from 'ember-resources/util/function';

export default class OrderStatsComponent extends Component {
  @service('case') caseService;

  vatRateData = trackedFunction(this, async () => {
    return await this.case?.vatRate;
  });

  depositInvoicesData = trackedFunction(this, async () => {
    return await this.case.depositInvoices;
  });

  depositsAmountData = trackedFunction(this, async () => {
    const invoice = await this.case?.invoice;
    return invoice?.paidDeposits;
  });

  get case() {
    return this.caseService.current.case;
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
    return sum(this.depositInvoicesData.value?.mapBy('arithmeticAmount'));
  }
}

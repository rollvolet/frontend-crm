import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { trackedFunction } from 'ember-resources/util/function';
import sum from '../../utils/math/sum';

export default class InvoiceStatsComponent extends Component {
  @service store;

  caseData = trackedFunction(this, async () => {
    return await this.args.model.case;
  });

  vatRateData = trackedFunction(this, async () => {
    const _case = this.caseData.value;
    return await _case?.vatRate;
  });

  depositInvoicesData = trackedFunction(this, async () => {
    const _case = this.caseData.value;
    return _case ? await _case.depositInvoices : [];
  });

  get case() {
    return this.caseData.value;
  }

  get vatRate() {
    return this.vatRateData.value;
  }

  get totalAmount() {
    // in case of Access a fixed number, otherwise the sum of the invoicelines
    return this.args.model.totalAmountNet;
  }

  get vatPercentage() {
    return this.vatRate && this.vatRate.rate / 100;
  }

  get totalVat() {
    // assumption that all invoicelines have the same vatRate as the order
    return this.totalAmount * this.vatPercentage;
  }

  get depositsAmount() {
    return this.args.model.paidDeposits || 0.0;
  }

  get depositInvoicesAmount() {
    return sum(this.depositInvoicesData.value?.mapBy('arithmeticAmount'));
  }
}

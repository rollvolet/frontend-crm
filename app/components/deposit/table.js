import Component from '@glimmer/component';

export default class DepositTableComponent extends Component {
  get sortedDeposits() {
    return this.args.model.sortBy('paymentDate');
  }
}

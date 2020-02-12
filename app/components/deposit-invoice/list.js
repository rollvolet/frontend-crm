import Component from '@glimmer/component';

export default class DepositInvoiceListComponent extends Component {
  get sortedDepositInvoices() {
    return this.args.model.sortBy('number');
  }
}

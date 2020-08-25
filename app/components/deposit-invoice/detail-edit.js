import Component from '@glimmer/component';

export default class DepositInvoiceDetailEditComponent extends Component {
  get isLimitedUpdateOnly() {
    return (this.args.model && this.args.model.isBooked) || this.args.invoice;
  }
}

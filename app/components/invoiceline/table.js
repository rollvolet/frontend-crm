import Component from '@glimmer/component';

export default class InvoicelineTableComponent extends Component {
  get sortedInvoicelines() {
    return this.args.model.sortBy('sequenceNumber');
  }
}

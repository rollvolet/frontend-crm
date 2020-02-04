import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class InvoiceDetailEditComponent extends Component {
  @action
  setVatRate(vatRate) {
    this.args.model.vatRate = vatRate;
    this.args.model.certificateRequired = vatRate && vatRate.rate == 6;
    this.args.onChangeVatRate(vatRate);
  }
}

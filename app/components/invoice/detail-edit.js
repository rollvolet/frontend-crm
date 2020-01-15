import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class InvoiceDetailEditComponent extends Component {
  @action
  setVatRate(vatRate) {
    this.args.set('model.vatRate', vatRate);
    this.args.set('model.certificateRequired', vatRate.rate == 6);
  }
}

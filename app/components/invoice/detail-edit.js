import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class InvoiceDetailEditComponent extends Component {
  @action
  setVatRate(vatRate) {
    this.args.model.set('vatRate', vatRate);
    this.args.model.set('certificateRequired', vatRate && vatRate.rate == 6);
    this.args.onChangeVatRate(vatRate);
  }
}

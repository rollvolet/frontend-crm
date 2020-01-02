import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Component from '@ember/component';

@classic
export default class InvoiceEditForm extends Component {
  @action
  setVatRate(vatRate) {
    this.set('model.vatRate', vatRate);
    this.set('model.certificateRequired', vatRate.rate == 6);
  }
}
